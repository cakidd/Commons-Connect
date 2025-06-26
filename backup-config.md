# MountainShares Production Configuration Backup

## Contract Addresses (Safe to backup)
- Governance Contract: 0x57fC62371582F9Ba976887658fd44AE86fa0298a
- Settlement Treasury: 0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95
- Complete Payment Processor: 0x1F0c8a4c920E1094f85b18F681dcfB2e2b7DE076
- MountainShares Token: 0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D

## Network Configuration
- RPC URL: https://arb1.arbitrum.io/rpc/[API_KEY]
- Network: Arbitrum One (Chain ID: 42161)

## Server Configuration
- Port: 3001
- PM2 Instances: 8 (cluster mode)
- Node Version: v18.20.8

## Required Environment Variables (VALUES NOT INCLUDED)
- STRIPE_SECRET_KEY=sk_live_[REDACTED]
- STRIPE_WEBHOOK_SECRET=whsec_[REDACTED]
- PRIVATE_KEY=[REDACTED]
- RPC_URL=[REDACTED]
