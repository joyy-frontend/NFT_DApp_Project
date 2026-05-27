# Sepolia Deployment

## 1. Prepare the deployer wallet

Use a test wallet only. Do not share the private key or secret recovery phrase.

Create `contracts/.env` from `.env.example`:

```sh
cp .env.example .env
```

Fill in:

```text
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_without_0x
```

The deployer wallet needs SepoliaETH for gas.

## 2. Deploy

From `contracts`:

```sh
npm run compile
npm run deploy:sepolia
```

The deploy script deploys:

1. `MintAnimalToken`
2. `SaleAnimalToken`
3. `MintAnimalToken.setSaleAnimalToken(...)`

It also writes the addresses to `contracts/deployments/sepolia.json`.

## 3. Connect the frontend

Create `frontend/.env` from `frontend/.env.example` and paste the deployed addresses:

```text
REACT_APP_MINT_ANIMAL_TOKEN_ADDRESS=0x...
REACT_APP_SALE_ANIMAL_TOKEN_ADDRESS=0x...
```

Restart the React dev server after changing `.env`.
