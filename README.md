# ClubChain

> Blockchain-powered event management platform for organizations, clubs, and communities

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Sui](https://img.shields.io/badge/Sui-Blockchain-6fbcf0)](https://sui.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Move](https://img.shields.io/badge/Move-Smart%20Contracts-00d4aa)](https://move-language.github.io/move/)

ClubChain is a decentralized application (dApp) built on the Sui blockchain that enables organizations, clubs, and communities to manage events, memberships, and fundraising with complete transparency and security. The platform is adaptable for universities, companies, DAOs, and any community-driven organization.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

ClubChain provides a comprehensive solution for organizations to:

- Create and manage clubs/organizations with on-chain governance
- Organize events with transparent scheduling and conflict detection
- Manage memberships using Soul-Bound Tokens (SBTs)
- Handle fundraising through transparent escrow pools
- Upload and share media for events via IPFS
- Track participation with blockchain-verified badges

### Key Benefits

- **Decentralized**: All data stored on Sui blockchain
- **Transparent**: Public, verifiable transactions
- **Secure**: Role-based access control with capabilities
- **Immutable**: Event history cannot be tampered with
- **User-Friendly**: Modern Next.js frontend

### Architecture

```
Frontend Layer (Next.js + React + TypeScript)
    ↕
Blockchain Layer (Sui Move Smart Contracts)
```

---

## Features

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| Event Management | Live | Create and publish events on-chain |
| Conflict Detection | Live | Prevent scheduling conflicts automatically |
| Fundraising Pools | Live | Transparent escrow pools for events |
| Member Registration | Live | OAuth authentication with Soul-Bound Member Badge |
| Club Management | Live | Create clubs, manage ownership with ClubOwnerBadge |
| Event Media | Live | Upload and share media via IPFS |
| Participation Badges | Live | Blockchain-verified badges for participation |
| Donations | Live | Transparent SUI donations to clubs |
| Admin Dashboard | Live | Manage clubs, view events, track memberships |

### Upcoming Features

- Ranking & Leaderboards
- Advanced Analytics
- Notification System
- Mobile App (iOS & Android)
- Multi-Chain Support
- NFT Integration
- Governance Voting
- Event Ticketing
- Social Features
- API & Webhooks

### Security Features

- **Soul-Bound Tokens**: Non-transferable badges for verified members
- **Capability-Based Access Control**: On-chain permission verification
- **Role-Based Permissions**: Club owners, admins, and members have distinct roles
- **Input Validation**: Both frontend and contract-level validation

---

## Tech Stack

### Frontend

- **Framework**: Next.js 16.0 (App Router)
- **UI**: React 19, TypeScript 5, Tailwind CSS 4
- **State**: Zustand + TanStack Query
- **Blockchain**: @mysten/dapp-kit
- **Authentication**: NextAuth.js (42 Intra OAuth, Google OAuth)
- **Storage**: Web3.Storage (IPFS)

### Smart Contracts

- **Language**: Move
- **Platform**: Sui Blockchain
- **Framework**: Sui Framework (testnet)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Sui CLI ([Installation Guide](https://docs.sui.io/build/install))
- Sui Wallet browser extension
- OAuth Provider Account (42 Intra or Google)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd soosnso
```

2. **Install frontend dependencies**

```bash
cd clubchain-frontend
npm install
```

3. **Build smart contracts**

```bash
cd ../clubchain_contracts
sui move build
```

### Configuration

1. **Update contract addresses** in `clubchain-frontend/lib/constants.ts`:

```typescript
export const PACKAGE_ID = "YOUR_PACKAGE_ID";
export const MEMBER_REGISTRY_ID = "YOUR_REGISTRY_ID";
export const CLOCK_OBJECT_ID = "0x6";
```

2. **Set up environment variables** (`.env.local`):

```bash
NEXT_PUBLIC_PACKAGE_ID=your_package_id
NEXT_PUBLIC_MEMBER_REGISTRY_ID=your_registry_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 42 Intra OAuth (optional)
FORTYTWO_CLIENT_ID=your_42_client_id
FORTYTWO_CLIENT_SECRET=your_42_client_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

3. **Configure OAuth Providers**

**42 Intra OAuth:**
- Register at [42 Intra API](https://api.intra.42.fr/)
- Set redirect URI: `http://localhost:3000/api/auth/callback/42-school`

**Google OAuth:**
- Create project in [Google Cloud Console](https://console.cloud.google.com/)
- Enable Google+ API and create OAuth 2.0 credentials
- Set redirect URI: `http://localhost:3000/api/auth/callback/google`

### Running the Application

```bash
cd clubchain-frontend
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and connect your Sui Wallet.

---

## Smart Contracts

### Module: `club_system`

Main module containing core functionality:

**Key Structs:**
- `Club`: Club with name, description, and treasury
- `Event`: Event details with scheduling
- `ClubOwnerBadge`: Soul-bound token for club ownership (expires after 365 days)
- `MemberBadge`: Soul-bound token for verified members
- `ParticipationBadge`: Proof of event participation
- `MemberRegistry`: Tracks registered members

**Key Functions:**
```move
create_club(name, desc, clock, ctx)
create_event(badge, club, title, start_time, end_time, blob_id, description, clock, ctx)
register_member(registry, intra_id, username, ctx)
join_event(member_badge, event, ctx)
donate_to_club(member_badge, club, payment, amount, ctx)
withdraw_donations(owner_badge, club, amount, ctx)
```

### Module: `event_media`

Handles media uploads for events:

```move
publish_media(event_id, media_url, media_type, clock, ctx)
```

### Security Model

1. **Capability-Based Access**: Admin operations require `ClubOwnerBadge` or `SuperAdminCap`
2. **Soul-Bound Tokens**: Badges are non-transferable (`key` only, no `store`)
3. **Expiration Checks**: `ClubOwnerBadge` expires after set duration
4. **Input Validation**: All functions validate inputs and emit events

### Testing

```bash
cd clubchain_contracts
sui move test
```

---

## Deployment

### Smart Contracts

```bash
cd clubchain_contracts
sui move build
sui client publish --gas-budget 100000000
```

Update `clubchain-frontend/lib/constants.ts` with new Package ID and Registry ID.

### Frontend

**Vercel Deployment:**
1. Connect repository to Vercel
2. Set environment variables (see Configuration section)
3. Deploy

**Manual Deployment:**
```bash
cd clubchain-frontend
npm run build
npm start
```


---

## Roadmap

### Phase 1: Advanced Features (Q2 2025)
- [ ] Ranking & Leaderboards system
- [ ] Advanced analytics dashboard
- [ ] Real-time notification system
- [ ] Social features (feed, comments, likes)
- [ ] Event ticketing with QR codes

### Phase 2: Multi-Chain & NFTs (Q3 2025)
- [ ] Multi-chain support (Aptos, Ethereum L2s)
- [ ] NFT minting for special events
- [ ] NFT-based membership tiers
- [ ] Cross-chain bridge integration

### Phase 3: Governance & Enterprise (2026)
- [ ] On-chain voting system
- [ ] Proposal management
- [ ] Treasury management
- [ ] Enterprise features and white-label solutions
- [ ] Custom branding and theming

---


## License

This project is licensed under the MIT License.

---

## Acknowledgments

- **42 Network** for the educational platform
- **Sui Foundation** for the blockchain infrastructure
- **Next.js Team** for the amazing framework
- **All Contributors** who helped build ClubChain

---


