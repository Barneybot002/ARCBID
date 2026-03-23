use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("66BBhkds8KTby6PH2msQmLr9qDgzosefvTWf6KZRyzaf");

// ─── Constants ───
const MAX_TITLE_LEN: usize = 100;


// Status constants
const STATUS_ACTIVE: u8 = 0;
const STATUS_SETTLED: u8 = 1;
const STATUS_NO_WINNER: u8 = 2;

// Auction type constants
const AUCTION_TYPE_FIRST_PRICE: u8 = 0;
const AUCTION_TYPE_VICKREY: u8 = 1;

#[program]
pub mod arcbid_program {
    use super::*;

    /// Creates a new sealed-bid auction.
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        title: String,
        auction_type: u8,
        end_time: i64,
        reserve_price: u64,
        uuid: String,
    ) -> Result<()> {
        // Validate uuid length (Solana max seed = 32 bytes)
        require!(uuid.len() <= 32, ArcBidError::SeedTooLong);

        // Validate title length
        require!(title.len() <= MAX_TITLE_LEN, ArcBidError::TitleTooLong);

        // Validate auction_type is 0 or 1
        require!(
            auction_type == AUCTION_TYPE_FIRST_PRICE || auction_type == AUCTION_TYPE_VICKREY,
            ArcBidError::InvalidAuctionType
        );

        // Validate end_time is in the future
        let clock = Clock::get()?;
        require!(end_time > clock.unix_timestamp, ArcBidError::EndTimeInPast);

        // Initialize auction account
        let auction = &mut ctx.accounts.auction_account;
        auction.seller = ctx.accounts.seller.key();
        auction.title = title;
        auction.auction_type = auction_type;
        auction.end_time = end_time;
        auction.reserve_price = reserve_price;
        auction.status = STATUS_ACTIVE;
        auction.winner = System::id();
        auction.winning_price = 0;
        auction.bid_count = 0;
        auction.bump = ctx.bumps.auction_account;

        msg!(
            "Auction created: {} by {}",
            auction.title,
            auction.seller
        );

        Ok(())
    }

    /// Places a sealed bid on an active auction.
    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction_account;

        // Validate auction is active
        require!(auction.status == STATUS_ACTIVE, ArcBidError::AuctionNotActive);

        // Validate current time is before end_time
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < auction.end_time,
            ArcBidError::AuctionNotActive
        );

        // Validate amount > reserve_price if reserve exists
        if auction.reserve_price > 0 {
            require!(amount >= auction.reserve_price, ArcBidError::BidTooLow);
        }

        // Transfer lamports from bidder to escrow account
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.bidder.to_account_info(),
                    to: ctx.accounts.escrow_account.to_account_info(),
                },
            ),
            amount,
        )?;

        // Initialize bid account
        let bid = &mut ctx.accounts.bid_account;
        bid.auction = auction.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        bid.bump = ctx.bumps.bid_account;

        // Increment bid count
        auction.bid_count = auction.bid_count.checked_add(1).unwrap();

        msg!(
            "Bid placed: {} lamports on auction {} by {}",
            amount,
            auction.key(),
            ctx.accounts.bidder.key()
        );

        Ok(())
    }

    /// Settles an auction after its end time has passed.
    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction_account;

        // Validate auction is active
        require!(auction.status == STATUS_ACTIVE, ArcBidError::AuctionAlreadySettled);

        // Validate current time is after end_time
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= auction.end_time,
            ArcBidError::AuctionNotEnded
        );

        // If no bids, set status to no_winner
        if auction.bid_count == 0 {
            auction.status = STATUS_NO_WINNER;
            msg!("Auction {} ended with no bids", auction.key());
            return Ok(());
        }

        // Otherwise set to settled — winner determination is off-chain
        auction.status = STATUS_SETTLED;
        msg!("Auction {} settled", auction.key());

        Ok(())
    }

    /// Updates the winner and winning price on a settled auction.
    pub fn update_winner(
        ctx: Context<UpdateWinner>,
        winner: Pubkey,
        winning_price: u64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction_account;

        // Validate auction is settled
        require!(auction.status == STATUS_SETTLED, ArcBidError::AuctionNotActive);

        auction.winner = winner;
        auction.winning_price = winning_price;

        msg!(
            "Winner updated: {} with price {} lamports",
            winner,
            winning_price
        );

        Ok(())
    }

    /// Allows the seller to claim the winning price from the winner's escrow.
    pub fn claim_payment(ctx: Context<ClaimPayment>) -> Result<()> {
        let auction = &ctx.accounts.auction_account;

        // Validate caller is the seller
        require!(
            ctx.accounts.seller.key() == auction.seller,
            ArcBidError::NotSeller
        );

        // Validate auction is settled and has a winner
        require!(auction.status == STATUS_SETTLED, ArcBidError::AuctionNotActive);
        require!(auction.winner != System::id(), ArcBidError::NotWinner);

        let winning_price = auction.winning_price;

        // Transfer winning_price from escrow to seller
        let escrow = &ctx.accounts.escrow_account;
        let escrow_lamports = escrow.lamports();
        require!(escrow_lamports >= winning_price, ArcBidError::BidTooLow);

        **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -= winning_price;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += winning_price;

        msg!(
            "Payment claimed: {} lamports to seller {}",
            winning_price,
            auction.seller
        );

        Ok(())
    }

    /// Refunds a non-winning bidder's escrowed SOL after auction settles.
    pub fn refund_bid(ctx: Context<RefundBid>) -> Result<()> {
        let auction = &ctx.accounts.auction_account;

        // Validate auction is settled or has no winner
        require!(
            auction.status == STATUS_SETTLED || auction.status == STATUS_NO_WINNER,
            ArcBidError::AuctionNotActive
        );

        // Validate bidder is not the winner
        require!(
            ctx.accounts.bidder.key() != auction.winner,
            ArcBidError::NotBidder
        );

        let bid = &ctx.accounts.bid_account;
        let refund_amount = bid.amount;

        // Transfer full bid amount from escrow back to bidder
        **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.bidder.to_account_info().try_borrow_mut_lamports()? += refund_amount;

        // Close escrow account — send remaining rent lamports to bidder
        let remaining = ctx.accounts.escrow_account.lamports();
        **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.bidder.to_account_info().try_borrow_mut_lamports()? += remaining;

        msg!(
            "Refund: {} lamports to bidder {}",
            refund_amount,
            ctx.accounts.bidder.key()
        );

        Ok(())
    }
}

// ─── Account Structures ───

#[account]
pub struct AuctionAccount {
    /// The seller's public key.
    pub seller: Pubkey,         // 32
    /// Auction title (max 100 chars).
    pub title: String,          // 4 + MAX_TITLE_LEN
    /// 0 = First Price, 1 = Vickrey.
    pub auction_type: u8,       // 1
    /// Unix timestamp when auction ends.
    pub end_time: i64,          // 8
    /// Minimum bid in lamports (0 = no reserve).
    pub reserve_price: u64,     // 8
    /// 0 = active, 1 = settled, 2 = no winner.
    pub status: u8,             // 1
    /// Winner pubkey (system program ID if none).
    pub winner: Pubkey,         // 32
    /// Winning price in lamports.
    pub winning_price: u64,     // 8
    /// Number of bids placed.
    pub bid_count: u64,         // 8
    /// PDA bump seed.
    pub bump: u8,               // 1
}

// 8 (discriminator) + 32 + (4 + 100) + 1 + 8 + 8 + 1 + 32 + 8 + 8 + 1 = 211
const AUCTION_ACCOUNT_SIZE: usize = 8 + 32 + (4 + MAX_TITLE_LEN) + 1 + 8 + 8 + 1 + 32 + 8 + 8 + 1;

#[account]
pub struct BidAccount {
    /// The auction this bid belongs to.
    pub auction: Pubkey,        // 32
    /// The bidder's public key.
    pub bidder: Pubkey,         // 32
    /// Bid amount in lamports.
    pub amount: u64,            // 8
    /// PDA bump seed.
    pub bump: u8,               // 1
}

// 8 (discriminator) + 32 + 32 + 8 + 1 = 81
const BID_ACCOUNT_SIZE: usize = 8 + 32 + 32 + 8 + 1;

// ─── Instruction Contexts ───

#[derive(Accounts)]
#[instruction(title: String, auction_type: u8, end_time: i64, reserve_price: u64, uuid: String)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = AUCTION_ACCOUNT_SIZE,
        seeds = [b"auction", seller.key().as_ref(), uuid.as_bytes()],
        bump,
    )]
    pub auction_account: Account<'info, AuctionAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,

    #[account(mut)]
    pub auction_account: Account<'info, AuctionAccount>,

    #[account(
        init,
        payer = bidder,
        space = BID_ACCOUNT_SIZE,
        seeds = [b"bid", auction_account.key().as_ref(), bidder.key().as_ref()],
        bump,
    )]
    pub bid_account: Account<'info, BidAccount>,

    /// CHECK: This is the escrow PDA that holds the bid funds. It is
    /// validated by its seeds and is not deserialized.
    #[account(
        mut,
        seeds = [b"escrow", auction_account.key().as_ref(), bidder.key().as_ref()],
        bump,
    )]
    pub escrow_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(mut)]
    pub auction_account: Account<'info, AuctionAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(winner: Pubkey, winning_price: u64)]
pub struct UpdateWinner<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub auction_account: Account<'info, AuctionAccount>,
}

#[derive(Accounts)]
pub struct ClaimPayment<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut)]
    pub auction_account: Account<'info, AuctionAccount>,

    /// CHECK: Escrow PDA holding the winner's bid funds.
    #[account(
        mut,
        seeds = [b"escrow", auction_account.key().as_ref(), auction_account.winner.as_ref()],
        bump,
    )]
    pub escrow_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,

    pub auction_account: Account<'info, AuctionAccount>,

    #[account(
        mut,
        seeds = [b"bid", auction_account.key().as_ref(), bidder.key().as_ref()],
        bump = bid_account.bump,
        close = bidder,
    )]
    pub bid_account: Account<'info, BidAccount>,

    /// CHECK: Escrow PDA holding the bidder's funds.
    #[account(
        mut,
        seeds = [b"escrow", auction_account.key().as_ref(), bidder.key().as_ref()],
        bump,
    )]
    pub escrow_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ─── Error Codes ───

#[error_code]
pub enum ArcBidError {
    #[msg("Auction is not active.")]
    AuctionNotActive,

    #[msg("Auction has not ended yet.")]
    AuctionNotEnded,

    #[msg("Auction has already been settled.")]
    AuctionAlreadySettled,

    #[msg("Bid amount is too low.")]
    BidTooLow,

    #[msg("Invalid auction type. Must be 0 (First Price) or 1 (Vickrey).")]
    InvalidAuctionType,

    #[msg("End time must be in the future.")]
    EndTimeInPast,

    #[msg("Only the seller can perform this action.")]
    NotSeller,

    #[msg("No winner found for this auction.")]
    NotWinner,

    #[msg("Only a non-winning bidder can request a refund.")]
    NotBidder,

    #[msg("Title exceeds maximum length.")]
    TitleTooLong,

    #[msg("Seed exceeds maximum length of 32 bytes.")]
    SeedTooLong,
}
