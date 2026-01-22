export type LangType = 'en' | 'pt-br' | 'es' | 'fr';

type Content = {
  navbar: {
    marketplace: string;
    about: string;
    learn: string;
    login: string;
    register: string;
    account: string;
    dashboard: string;
    adminPanel: string;
    settings: string;
    balance: string;
    walletBalance: string;
    deposit: string;
    logout: string;
    signedInAs: string;
    refreshBalance: string;
  };
  common: {
    status: Record<string, string>;
    transactionTypes: Record<string, string>;
    actions: {
      edit: string;
      delete: string;
      pasteFromClipboard: string;
      moveUp: string;
      moveDown: string;
      remove: string;
      mainImage: string;
      setAsMain: string;
    };
    placeholders: {
      title: string;
      description: string;
      imageUrl: string;
      priceExample: string;
      tokensExample: string;
      monthlyYieldExample: string;
      propertyTitle: string;
      propertyDescription: string;
      location: string;
      priceUsd: string;
      totalTokens: string;
      yieldExample: string;
      addressExample: string;
    };
    images: {
      viewAlt: string;
      thumbnailAlt: string;
      noImages: string;
      previousImage: string;
      nextImage: string;
    };
  };
  home: {
    heroBadge: string;
    heroTitleLine1: string;
    heroTitleHighlight: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    heroBackgroundAlt: string;
    stats: {
      value: string;
      investors: string;
      yield: string;
      onChain: string;
    };
    features: {
      mainTitle: string;
      mainSubtitle: string;
      rentTitle: string;
      rentDesc: string;
      legalTitle: string;
      legalDesc: string;
      liquidityTitle: string;
      liquidityDesc: string;
    };
    finalCta: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  landing: {
    heroImageAlt: string;
    tokenizationImageAlt: string;
  };
  marketplace: {
    heroBadge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    errorFallback: string;
    emptyState: string;
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaMarketplace: string;
    heroCtaRegister: string;
    introTitle: string;
    introP1: string;
    introP2: string;
    introCta: string;
    tokenizationTitle: string;
    tokenizationP1: string;
    tokenizationP2: string;
    benefitsTitle: string;
    benefits: Array<{ title: string; desc: string }>;
    midCta: string;
    reTitle: string;
    reP1: string;
    reP2: string;
    finalCtaText: string;
    finalCtaPrimary: string;
    finalCtaSecondary: string;
    legalDisclosure: string;
  };
  learn: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaMarketplace: string;
    heroCtaRegister: string;
    whatIsTitle: string;
    whatIsLink: string;
    whatIsItems: Array<{ title: string; desc: string }>;
    whoCanInvestTitle: string;
    whoCanInvestLink: string;
    whoCanInvestItems: string[];
    processTitle: string;
    processSubtitle: string;
    processSteps: Array<{ title: string; desc: string }>;
    processCta: string;
    walletTitle: string;
    walletItems: Array<{ title: string; desc: string }>;
    feesTitle: string;
    fees: Array<{ title: string; rate: string; desc: string }>;
    glossaryTitle: string;
    glossary: Array<{ term: string; def: string }>;
    legalTitle: string;
    legalDesc: string;
    finalCtaText: string;
    finalCtaMarketplace: string;
    finalCtaRegister: string;
  };
  dashboard: {
    redirecting: string;
    title: string;
    welcomeBack: string;
    totalNetWorth: string;
    withdraw: string;
    cashBalance: string;
    assetValue: string;
    unclaimedRent: string;
    rewards: string;
    rewardsSubtitle: string;
    claimToWallet: string;
    assetsTitle: string;
    assetsEmpty: string;
    active: string;
    tokensOwned: string;
    currentValue: string;
    sellTokens: string;
    sellModalTitle: string;
    availableTokens: string;
    pricePerToken: string;
    amountToSell: string;
    sellAmountPlaceholder: string;
    proceedsNote: string;
    confirmSale: string;
    claimModalTitle: string;
    claimModalSubtitle: string;
    totalAmount: string;
    confirmAddToBalance: string;
    withdrawModalTitle: string;
    withdrawModalSubtitle: string;
    availableCash: string;
    amountToWithdrawLabel: string;
    amountToWithdrawPlaceholder: string;
    insufficientFunds: string;
    withdrawalAmountLabel: string;
    processingFeeLabel: string;
    youWillReceive: string;
    destinationBtcAddress: string;
    btcPlaceholder: string;
    requestWithdrawal: string;
    toastSellSuccess: string;
    toastClaimSuccess: string;
    toastMinWithdrawal: string;
    toastInsufficientCash: string;
    toastInvalidBtc: string;
    toastWithdrawRequest: string;
  };
  footer: {
    disclaimerText: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    contact: string;
  };
  transactionHistory: {
    title: string;
    refreshTitle: string;
    columnType: string;
    columnDate: string;
    columnAmount: string;
    columnInfo: string;
    columnStatus: string;
    columnExplorer: string;
    loading: string;
    errorTitle: string;
    errorFallback: string;
    empty: string;
    viewTx: string;
    viewAddress: string;
  };
  depositModal: {
    title: string;
    subtitle: string;
    amountLabel: string;
    amountPlaceholder: string;
    estPaymentLabel: string;
    minDepositNote: string;
    submitLoading: string;
    submitContinue: string;
    toastMinimumDeposit: string;
    toastAddressGenerated: string;
    toastSessionError: string;
    toastCreateOrderFailed: string;
  };
  settings: {
    title: string;
    subtitle: string;
    verifiedInvestor: string;
    accountLimits: string;
    depositLimit: string;
    depositLimitValue: string;
    withdrawalLimit: string;
    withdrawalLimitValue: string;
    requestHigherLimits: string;
    notificationsTitle: string;
    notificationsSubtitle: string;
    emailAlerts: string;
    emailAlertsDesc: string;
    securityAlerts: string;
    securityAlertsDesc: string;
    securityTitle: string;
    securitySubtitle: string;
    passwordPlaceholder: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    withdrawalAddressTitle: string;
    withdrawalAddressSubtitle: string;
    withdrawalAddressPlaceholder: string;
    edit: string;
    dangerZoneTitle: string;
    dangerZoneText: string;
    deleteAccount: string;
    toastPasswordTooShort: string;
    toastPasswordMismatch: string;
    toastPasswordUpdated: string;
    toastPasswordUpdateFailed: string;
    toastPreferenceUpdated: string;
    toastInvalidAddress: string;
    toastAddressSaved: string;
  };
  auth: {
    loginTitle: string;
    loginTitlePrefix: string;
    loginTitleBrand: string;
    loginSubtitle: string;
    loginIdentifierPlaceholder: string;
    loginPasswordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    loginButton: string;
    loginButtonLoading: string;
    loginNoAccount: string;
    loginRegisterLink: string;
    loginBotError: string;
    loginWelcome: string;
    loginFailed: string;
    loginSecurityError: string;
    registerTitlePrefix: string;
    registerTitleBrand: string;
    registerSubtitle: string;
    registerBullet1: string;
    registerBullet2: string;
    registerBullet3: string;
    registerUsernamePlaceholder: string;
    registerUsernameHint: string;
    registerEmailPlaceholder: string;
    registerPasswordPlaceholder: string;
    registerConfirmPasswordPlaceholder: string;
    registerPasswordRequirementsTitle: string;
    registerRequirementLength: string;
    registerRequirementUpper: string;
    registerRequirementLower: string;
    registerRequirementNumber: string;
    registerRequirementSpecial: string;
    registerButton: string;
    registerButtonLoading: string;
    registerTerms: string;
    registerTermsLink: string;
    registerTrustedBy: string;
    registerHaveAccount: string;
    registerLoginLink: string;
    toastRegisterMismatch: string;
    toastRegisterRequirements: string;
    toastRegisterCreated: string;
    toastRegisterSuccessLogin: string;
    email_verification_required: string;
    email_verification_sent: string;
    email_verification_pending_body: string;
    email_verification_resend: string;
    email_verification_resend_loading: string;
    email_verification_resend_failed: string;
    email_verification_resend_missing: string;
    email_verification_title: string;
    email_verification_loading: string;
    email_verification_success: string;
    email_verification_expired: string;
    email_verification_login: string;
    email_not_verified_error: string;
  };
  legal: {
    lastUpdated: string;
    privacy: {
      title: string;
      intro: string;
      sections: Array<{ title: string; content: string | string[] }>;
    };
    terms: {
      title: string;
      intro: string;
      sections: Array<{ title: string; content: string }>;
    };
    disclaimer: {
      title: string;
      introBox: string;
      introText: string;
      bullets: string[];
      closing: string;
    };
  };
  contactPage: {
    title: string;
    subtitle: string;
    emailTitle: string;
    emailDesc: string;
    chatTitle: string;
    chatDesc: string;
    officeTitle: string;
    officeDesc: string;
    formTitle: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      subject: string;
      message: string;
      submit: string;
    };
  };
  propertyDetails: {
    notFound: string;
    backToMarketplace: string;
    backToMarket: string;
    tokenizedAsset: string;
    estYield: string;
    investmentSummary: string;
    propertyHighlights: string;
    highlight1: string;
    highlight2: string;
    highlight3: string;
    highlight4: string;
    investTitle: string;
    investSubtitle: string;
    tokenPrice: string;
    available: string;
    amountTokens: string;
    tokensLabel: string;
    total: string;
    loginToInvest: string;
    confirmInvestment: string;
    secureTransaction: string;
    assetValue: string;
    totalTokens: string;
    orderCreated: string;
    orderFailed: string;
    loginToInvestButton: string;
    locationFallback: string;
    notAvailable: string;
  };
};

export const content: Record<LangType, Content> = {
  en: {
    navbar: {
      marketplace: 'Marketplace',
      about: 'About',
      learn: 'Learn',
      login: 'Log In',
      register: 'Get Started',
      account: 'My Account',
      dashboard: 'Dashboard',
      adminPanel: 'Admin Panel',
      settings: 'Settings',
      balance: 'Balance',
      walletBalance: 'Wallet Balance',
      deposit: 'Deposit',
      logout: 'Log Out',
      signedInAs: 'Signed in as',
      refreshBalance: 'Refresh Balance',
    },
    common: {
      status: {
        pending: 'Pending',
        processing: 'Processing',
        approved: 'Approved',
        completed: 'Completed',
        success: 'Success',
        rejected: 'Rejected',
        failed: 'Failed',
        canceled: 'Canceled',
        draft: 'Draft',
        active: 'Active',
        deleted: 'Deleted',
        funding: 'Funding',
        sold_out: 'Sold Out',
      },
      transactionTypes: {
        deposit: 'Deposit',
        withdrawal: 'Withdrawal',
        sell: 'Sell',
        rent_distribution: 'Rent Distribution',
        buy: 'Buy',
      },
      actions: {
        edit: 'Edit',
        delete: 'Delete',
        pasteFromClipboard: 'Paste from Clipboard',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        remove: 'Remove',
        mainImage: 'Main Image',
        setAsMain: 'Set as Main',
      },
      placeholders: {
        title: 'Title',
        description: 'Description',
        imageUrl: 'https://...',
        priceExample: '100k',
        tokensExample: '10k',
        monthlyYieldExample: '500',
        propertyTitle: 'Property Title',
        propertyDescription: 'Property description...',
        location: 'City, Country',
        priceUsd: '100000',
        totalTokens: '10000',
        yieldExample: '6-20% or ~12% or 10.5%',
        addressExample: 'e.g. 8a2f...',
      },
      images: {
        viewAlt: '{title} - View {index}',
        thumbnailAlt: 'Thumbnail {index}',
        noImages: 'No images available',
        previousImage: 'Previous image',
        nextImage: 'Next image',
      },
    },
    home: {
      heroBadge: 'Real Estate Tokenization',
      heroTitleLine1: 'Invest in American',
      heroTitleHighlight: 'Real Estate',
      heroTitleLine2: 'from $50',
      heroSubtitle:
        'Join the future of investment. Own fractional shares of high-yield rental properties on the blockchain. Receive monthly rent directly to your wallet.',
      heroCtaPrimary: 'View Properties',
      heroCtaSecondary: 'Create Account',
      heroBackgroundAlt: 'City skyline background',
      stats: {
        value: "Property Value",
        investors: "Investors",
        yield: "Avg. Yield",
        onChain: "On-Chain"
      },
      features: {
        mainTitle: "Why TerraVest?",
        mainSubtitle: "We've removed the barriers to entry. No banks, no paperwork, no hidden fees. Just pure ownership.",
        rentTitle: "Monthly Rent Visibility",
        rentDesc: "Rental income accrues daily based on your tokens and becomes visible in your dashboard at the beginning of each month.",
        legalTitle: "U.S. Legal Structure",
        legalDesc: "Each property is held by a dedicated U.S. LLC. Tokens represent indirect ownership rights, protected by U.S. property law.",
        liquidityTitle: "Secondary Market Liquidity",
        liquidityDesc: "Tokens can be sold on supported secondary markets, giving you flexibility without waiting months for a property sale."
      },
      finalCta: {
        title: "Ready to build your portfolio?",
        subtitle: "Start earning daily rental income with monthly clarity.",
        button: "Start Investing Now"
      }
    },
    landing: {
      heroImageAlt: 'Miami real estate skyline',
      tokenizationImageAlt: 'Tokenization graphic',
    },
    marketplace: {
      heroBadge: 'Live Opportunities',
      title: 'Curated U.S. Properties',
      subtitle: 'Invest in premium real estate starting from $50.',
      searchPlaceholder: 'Search properties...',
      errorFallback: 'Failed to load properties',
      emptyState: 'No properties found.',
    },
    about: {
      heroTitle: 'About TerraVest',
      heroSubtitle:
        'TerraVest is building a simpler, more global way to invest in income-producing real estate through tokenization.',
      heroCtaMarketplace: 'Explore Marketplace',
      heroCtaRegister: 'Create Account',
      introTitle: 'An Introduction to Tokenized Real Estate',
      introP1:
        'The way people invest in assets has continuously evolved - from physical ownership to paper certificates, and now to digital systems. Tokenization represents the next step in this evolution. By converting ownership rights into blockchain-based tokens, real-world assets can be accessed, transferred, and managed with far greater efficiency.',
      introP2:
        'At TerraVest, we apply tokenization to income-producing U.S. real estate. This approach makes property ownership more accessible, more transparent, and more flexible for investors worldwide.',
      introCta: 'View Tokenized Properties',
      tokenizationTitle: 'What Is Asset Tokenization?',
      tokenizationP1:
        'Asset tokenization is the process of converting rights to a real-world asset into a digital token on a blockchain. Each token represents a defined share of ownership and the associated economic rights. These tokens can be securely held, transferred, and tracked on a global digital ledger.',
      tokenizationP2:
        "In TerraVest's model, properties are owned by U.S.-based LLCs. Investors hold tokens that represent indirect ownership in these entities, giving them exposure to rental income without the complexity of traditional cross-border real estate investing.",
      benefitsTitle: 'Why Tokenization Matters',
      benefits: [
        {
          title: 'Transparency',
          desc: 'Ownership records and transfers are immutably recorded, increasing clarity and trust.',
        },
        {
          title: 'Liquidity',
          desc: 'Fractional tokens make traditionally illiquid assets easier to trade and rebalance.',
        },
        {
          title: 'Global Access',
          desc: 'Investors from around the world can access U.S. real estate without borders.',
        },
        {
          title: 'Lower Barriers',
          desc: 'Smaller minimum investments enable gradual, flexible portfolio building.',
        },
      ],
      midCta: 'Browse Marketplace',
      reTitle: 'Real Estate, Reimagined',
      reP1:
        'Imagine a $100,000 rental property divided into 100 tokens. Each token represents a 1% share of the property. By purchasing tokens, investors can gradually build ownership - from a small allocation to a meaningful position - without committing large amounts of capital upfront.',
      reP2:
        'This structure allows investors to diversify, adjust their exposure, and access rental income while maintaining flexibility that traditional real estate investing often lacks.',
      finalCtaText:
        'Start investing in tokenized real estate with daily income accrual and monthly visibility.',
      finalCtaPrimary: 'Create Account',
      finalCtaSecondary: 'Explore Marketplace',
      legalDisclosure:
        'TerraVest provides access to tokenized real estate investments through property-holding U.S. LLCs. Investments involve risk, including potential loss of capital, vacancy, market fluctuations, and regulatory changes. Rental income is not guaranteed and past performance is not indicative of future results. Nothing on this website constitutes financial or investment advice.',
    },
    learn: {
      heroTitle: 'Learn How TerraVest Works',
      heroSubtitle:
        'Earn daily rental income from U.S. real estate - with monthly clarity in your dashboard.',
      heroCtaMarketplace: 'Marketplace',
      heroCtaRegister: 'Create Account',
      whatIsTitle: 'What is TerraVest?',
      whatIsLink: 'About TerraVest',
      whatIsItems: [
        {
          title: 'What is TerraVest?',
          desc: 'TerraVest is a real estate investment platform that tokenizes income-producing U.S. properties. Each property is owned by a U.S. LLC and divided into digital tokens, allowing investors to own fractions of rental real estate instead of buying entire properties.',
        },
        {
          title: 'Built for Global Investors',
          desc: 'TerraVest is designed for international investors who want exposure to the U.S. property market without U.S. residency, local banks, or complex cross-border paperwork.',
        },
        {
          title: 'Low Minimums',
          desc: 'By fractionalizing ownership, TerraVest lowers the barrier to entry. Investors can start with small amounts instead of committing tens of thousands of dollars upfront.',
        },
      ],
      whoCanInvestTitle: 'Who Can Invest?',
      whoCanInvestLink: 'Register',
      whoCanInvestItems: [
        'Open to investors from most countries worldwide.',
        'No U.S. visa, residency, or American bank account required.',
        'Compliance restrictions apply to sanctioned or high-risk jurisdictions.',
        'Ideal for non-U.S. investors seeking stable, dollar-denominated rental income.',
      ],
      processTitle: 'How Investing Works',
      processSubtitle:
        'Tokens earn rent daily. Earnings are aggregated and shown in your dashboard at the start of each month.',
      processSteps: [
        {
          title: '1. Explore the Marketplace',
          desc: 'Browse vetted U.S. rental properties in the marketplace. Each listing shows expected yield, rental details, and legal structure.',
        },
        {
          title: '2. Buy Property Tokens',
          desc: 'When you invest, you purchase tokens that represent fractional ownership in a specific property-holding U.S. LLC.',
        },
        {
          title: '3. Daily Rent Accrual',
          desc: 'Rental income accrues daily based on the exact number of tokens you hold. Earnings accumulate continuously in the background.',
        },
        {
          title: '4. Monthly Dashboard Payout',
          desc: 'At the beginning of each month, your accrued rent becomes visible in your dashboard as income. From there, you can claim it or reinvest it.',
        },
      ],
      processCta: 'View Marketplace',
      walletTitle: 'Wallet, Security & Income Flow',
      walletItems: [
        {
          title: 'Investor Wallet',
          desc: "Hold property tokens and rental income in one place. Use TerraVest's integrated wallet or connect your own external wallet.",
        },
        {
          title: 'Flexible Income Use',
          desc: 'Once rent appears in your dashboard each month, you can withdraw it or reinvest directly into new property tokens.',
        },
        {
          title: 'Security & Control',
          desc: 'Non-custodial architecture, strong authentication, and no storage of private keys on TerraVest servers.',
        },
      ],
      feesTitle: 'Fees & Transparency',
      fees: [
        {
          title: 'Trading Fee',
          rate: '1.5%',
          desc: 'Applied when buying or selling tokens. Covers platform operations, legal structuring, and compliance.',
        },
        {
          title: 'Property Management',
          rate: '10%',
          desc: 'Deducted from rental income before distribution. Covers tenants, maintenance, insurance, and local taxes.',
        },
        {
          title: 'Withdrawal Fee',
          rate: '$5 + 1%',
          desc: 'Only applies when transferring funds to an external wallet to cover network and processing costs.',
        },
      ],
      glossaryTitle: 'Glossary',
      glossary: [
        {
          term: 'Tokenized Real Estate',
          def: 'A structure where real estate ownership is represented by blockchain tokens, enabling fractional ownership and easier transfers.',
        },
        {
          term: 'Daily Accrual',
          def: 'Rental income is calculated and accumulated every day based on token ownership, even though it is shown monthly.',
        },
        {
          term: 'U.S. LLC',
          def: 'A legal entity that holds the property title and limits investor liability.',
        },
      ],
      legalTitle: 'Legal & Risk Disclosure',
      legalDesc:
        'TerraVest provides access to tokenized real estate investments. Investing in real estate involves risks, including but not limited to market fluctuations, tenant vacancies, property expenses, and regulatory changes. Rental income is not guaranteed and past performance does not predict future results. Tokens represent indirect ownership through property-holding U.S. LLCs and do not constitute securities, financial advice, or an offer to the public where prohibited by law.',
      finalCtaText: 'Start earning daily rental income with monthly clarity.',
      finalCtaMarketplace: 'Marketplace',
      finalCtaRegister: 'Create Account',
    },
    dashboard: {
      redirecting: 'Loading...',
      title: 'My Portfolio',
      welcomeBack: 'Welcome back',
      totalNetWorth: 'Total Net Worth',
      withdraw: 'Withdraw',
      cashBalance: 'Cash Balance',
      assetValue: 'Asset Value',
      unclaimedRent: 'Unclaimed Rent',
      rewards: 'Rewards',
      rewardsSubtitle: 'Accumulated from rentals',
      claimToWallet: 'Claim to Wallet',
      assetsTitle: 'Your Assets',
      assetsEmpty: 'No active assets found. Start investing from the Marketplace!',
      active: 'Active',
      tokensOwned: 'Tokens Owned',
      currentValue: 'Current Value',
      sellTokens: 'Sell Tokens',
      sellModalTitle: 'Sell Tokens',
      availableTokens: 'Available Tokens:',
      pricePerToken: 'Price per Token:',
      amountToSell: 'Amount to Sell',
      sellAmountPlaceholder: '0',
      proceedsNote:
        'Proceeds (minus 1.5% fee) will be added to your USD Balance immediately.',
      confirmSale: 'Confirm Sale',
      claimModalTitle: 'Claim Rewards',
      claimModalSubtitle: 'Move your accumulated rent to your wallet.',
      totalAmount: 'Total Amount',
      confirmAddToBalance: 'Confirm & Add to Balance',
      withdrawModalTitle: 'Withdraw Funds',
      withdrawModalSubtitle: 'Transfer USD balance to your Bitcoin wallet.',
      availableCash: 'Available Cash:',
      amountToWithdrawLabel: 'Amount to Withdraw (USD)',
      amountToWithdrawPlaceholder: 'Min $50',
      insufficientFunds: 'Insufficient funds',
      withdrawalAmountLabel: 'Withdrawal Amount:',
      processingFeeLabel: 'Processing Fee ($5 + 1%):',
      youWillReceive: 'You will receive:',
      destinationBtcAddress: 'Destination BTC Address',
      btcPlaceholder: 'bc1q...',
      requestWithdrawal: 'Request Withdrawal',
      toastSellSuccess: 'Asset sold! Funds added to your USD balance.',
      toastClaimSuccess: 'Claimed ${amount} to your balance!',
      toastMinWithdrawal: 'Minimum withdrawal is $50',
      toastInsufficientCash: 'Insufficient cash balance',
      toastInvalidBtc: 'Invalid BTC address',
      toastWithdrawRequest: 'Withdrawal request submitted! Pending Admin Approval.',
    },
    footer: {
      disclaimerText: 'This website is provided for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or investment products. Past performance is not indicative of future results.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      disclaimer: 'Disclaimer',
      contact: 'Contact',
    },
    transactionHistory: {
      title: 'Transaction History',
      refreshTitle: 'Refresh',
      columnType: 'Type',
      columnDate: 'Date',
      columnAmount: 'Amount',
      columnInfo: 'Info',
      columnStatus: 'Status',
      columnExplorer: 'Explorer',
      loading: 'Loading transactions...',
      errorTitle: 'Could not load transactions.',
      errorFallback: 'Network Error',
      empty: 'No transactions found.',
      viewTx: 'View TX',
      viewAddress: 'Address',
    },
    depositModal: {
      title: 'Deposit Funds',
      subtitle: 'Add USD to your wallet via Bitcoin.',
      amountLabel: 'Amount to Deposit (USD)',
      amountPlaceholder: '100',
      estPaymentLabel: 'Est. Payment:',
      minDepositNote:
        'Minimum deposit amount is {min}. Your balance will be updated automatically after 1 network confirmation.',
      submitLoading: 'Generating Address...',
      submitContinue: 'Continue',
      toastMinimumDeposit: 'Minimum deposit is {min}',
      toastAddressGenerated: 'Deposit address generated!',
      toastSessionError:
        'Session information could not be read. Please refresh the page and log in again.',
      toastCreateOrderFailed: 'Failed to create order. Is backend running?',
    },
    settings: {
      title: 'Account Settings',
      subtitle: 'Manage your security, preferences, and verified status.',
      verifiedInvestor: 'Verified Investor',
      accountLimits: 'Account Limits',
      depositLimit: 'Deposit Limit',
      depositLimitValue: '$50,000 / mo',
      withdrawalLimit: 'Withdrawal Limit',
      withdrawalLimitValue: '$100,000 / mo',
      requestHigherLimits: 'Request Higher Limits',
      notificationsTitle: 'Notifications',
      notificationsSubtitle: 'Manage how we communicate with you.',
      emailAlerts: 'Email Alerts',
      emailAlertsDesc: 'Receive transactional emails',
      securityAlerts: 'Security Alerts',
      securityAlertsDesc: 'Login attempts and password changes',
      securityTitle: 'Security',
      securitySubtitle: 'Update your password and security settings.',
      passwordPlaceholder: '********',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      withdrawalAddressTitle: 'Withdrawal Address',
      withdrawalAddressSubtitle: 'Save your default BTC wallet for faster withdrawals.',
      withdrawalAddressPlaceholder: 'Enter BTC Address (bc1q...)',
      edit: 'Edit',
      dangerZoneTitle: 'Danger Zone',
      dangerZoneText:
        'Once you delete your account, there is no going back. Please be certain.',
      deleteAccount: 'Delete Account',
      toastPasswordTooShort: 'Password must be at least 8 characters.',
      toastPasswordMismatch: 'New passwords do not match.',
      toastPasswordUpdated: 'Password updated successfully!',
      toastPasswordUpdateFailed: 'Failed to update password',
      toastPreferenceUpdated: 'Preference updated',
      toastInvalidAddress: 'Invalid address format',
      toastAddressSaved: 'Withdrawal address saved!',
    },
    auth: {
      loginTitle: 'TerraVest',
      loginTitlePrefix: 'Terra',
      loginTitleBrand: 'Vest',
      loginSubtitle: 'Login to access your portfolio',
      loginIdentifierPlaceholder: 'Email or Username',
      loginPasswordPlaceholder: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password',
      loginButton: 'Login',
      loginButtonLoading: 'Loading...',
      loginNoAccount: "Don't have an account?",
      loginRegisterLink: 'Register',
      loginBotError: 'Please confirm you are not a robot',
      loginWelcome: 'Welcome back!',
      loginFailed: 'Unsuccessful Login',
      loginSecurityError: 'Security verification failed to load.',
      registerTitlePrefix: 'Join',
      registerTitleBrand: 'TerraVest',
      registerSubtitle: 'Create your account to start investing',
      registerBullet1: 'Earn rent daily, visible monthly',
      registerBullet2: 'U.S. LLC-backed properties',
      registerBullet3: 'Start from $50 - no banks, no paperwork',
      registerUsernamePlaceholder: 'Username',
      registerUsernameHint:
        'Public username. Must be unique - can be changed later.',
      registerEmailPlaceholder: 'Email Address',
      registerPasswordPlaceholder: 'Password',
      registerConfirmPasswordPlaceholder: 'Confirm Password',
      registerPasswordRequirementsTitle: 'Password Requirements:',
      registerRequirementLength: 'At least 8 characters',
      registerRequirementUpper: 'At least one uppercase letter (A-Z)',
      registerRequirementLower: 'At least one lowercase letter (a-z)',
      registerRequirementNumber: 'At least one number (0-9)',
      registerRequirementSpecial: 'At least one special character (!@#$)',
      registerButton: 'Create Account',
      registerButtonLoading: 'Creating account...',
      registerTerms:
        'By creating an account, you acknowledge that tokenized real estate investments involve risk.',
      registerTermsLink: 'Learn more',
      registerTrustedBy: 'Trusted by investors from 40+ countries',
      registerHaveAccount: 'Already have an account?',
      registerLoginLink: 'Log In',
      toastRegisterMismatch: 'Passwords do not match.',
      toastRegisterRequirements: 'Please meet all password requirements.',
      toastRegisterCreated: 'Account created successfully!',
      toastRegisterSuccessLogin: 'Registration successful! Please log in.',
      email_verification_required: 'Please verify your email to continue',
      email_verification_sent: 'Verification email sent. Check your inbox.',
      email_verification_pending_body:
        'We sent a verification link to your email. Click the link to activate your account.',
      email_verification_resend: 'Resend verification email',
      email_verification_resend_loading: 'Sending verification email...',
      email_verification_resend_failed: 'Failed to resend verification email.',
      email_verification_resend_missing: 'Please enter your email to resend verification.',
      email_verification_title: 'Email Verification',
      email_verification_loading: 'Verifying your email...',
      email_verification_success: 'Email verified successfully.',
      email_verification_expired: 'Verification link is invalid or expired.',
      email_verification_login: 'Go to login',
      email_not_verified_error: 'Please verify your email before logging in.',
    },
    legal: {
      lastUpdated: 'Last updated: January 21, 2026',
      privacy: {
        title: 'Privacy Policy',
        intro: 'TerraVest ("TerraVest", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you share with us through our website and services.',
        sections: [
          { title: '1. Information We Collect', content: ['Email address', 'Name and basic contact details', 'Account registration information', 'Technical data (IP, browser, device)'] },
          { title: '2. How We Use Your Information', content: ['Provide access to our platform', 'Communicate regarding updates', 'Respond to inquiries', 'Improve our services', 'Comply with legal requirements'] },
          { title: '3. Data Security', content: 'We implement reasonable administrative and technical safeguards to protect your information.' },
          { title: '4. Your Rights', content: ['Access, correct, or delete your data', 'Withdraw consent', 'Request information about processing'] }
        ]
      },
      terms: {
        title: 'Terms of Service',
        intro: 'By accessing or using the TerraVest website or services, you agree to the following Terms of Service.',
        sections: [
          { title: '1. Platform Purpose', content: 'TerraVest provides a technology platform designed to present informational content related to tokenized real estate. Nothing on this website constitutes legal, financial, tax, or investment advice.' },
          { title: '2. Eligibility', content: 'You are responsible for ensuring that your use of TerraVest complies with the laws and regulations applicable in your jurisdiction.' },
          { title: '3. No Investment Offer', content: 'TerraVest does not offer securities or act as a broker, dealer, or investment advisor on this platform.' },
          { title: '4. Limitation of Liability', content: 'TerraVest shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.' }
        ]
      },
      disclaimer: {
        title: 'General Disclaimer',
        introBox: 'The information provided on TerraVest is for educational and informational purposes only.',
        introText: 'The content on this website does not constitute investment, financial, legal, or tax advice.',
        bullets: [
          'No Investment Advice: Seek professional consultation.',
          'Risk Warning: Real estate tokenization involves high risk.',
          'No Guarantees: Past performance is not indicative of future results.'
        ],
        closing: 'You should consult your own legal, tax, and financial advisors before making any investment decisions.'
      }
    },
    contactPage: {
      title: 'Contact Us',
      subtitle: 'Have questions about real estate tokenization? Our team is here to help.',
      emailTitle: 'Email Support',
      emailDesc: 'For general inquiries and support:',
      chatTitle: 'Live Chat',
      chatDesc: 'Available weekdays from 9am to 6pm EST.',
      officeTitle: 'Office',
      officeDesc: '100 Biscayne Blvd, Miami, FL 33132',
      formTitle: 'Send us a message',
      form: {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        subject: 'Subject',
        message: 'Message',
        submit: 'Send Message'
      }
    },
    propertyDetails: {
      notFound: 'Property not found.',
      backToMarketplace: 'Back to Marketplace',
      backToMarket: 'Back to Market',
      tokenizedAsset: 'Tokenized Asset',
      estYield: 'Est. Yield',
      investmentSummary: 'Investment Summary',
      propertyHighlights: 'Property Highlights',
      highlight1: 'Fully Managed Property',
      highlight2: 'Monthly Rent Payouts',
      highlight3: 'High Appreciation Potential',
      highlight4: 'Legal Ownership via LLC',
      investTitle: 'Invest in this Asset',
      investSubtitle: 'Instant ownership via TerraVest Tokens',
      tokenPrice: 'Token Price',
      available: 'Available',
      amountTokens: 'Amount (Tokens)',
      tokensLabel: 'Tokens',
      total: 'Total:',
      loginToInvest: 'You must be logged in to invest.',
      confirmInvestment: 'Confirm Investment',
      secureTransaction: 'Secure transaction via TerraVest',
      assetValue: 'Asset Value',
      totalTokens: 'Total Tokens',
      orderCreated: 'Order request created! Please go to Dashboard to complete payment.',
      orderFailed: 'Order failed.',
      loginToInvestButton: 'Login to Invest',
      locationFallback: 'United States',
      notAvailable: 'N/A',
    },
  },
  'pt-br': {
    navbar: {
      marketplace: 'Marketplace',
      about: 'Sobre',
      learn: 'Aprender',
      login: 'Entrar',
      register: 'Começar',
      account: 'Minha Conta',
      dashboard: 'Painel',
      adminPanel: 'Painel Admin',
      settings: 'Configurações',
      balance: 'Saldo',
      walletBalance: 'Saldo da Carteira',
      deposit: 'Depositar',
      logout: 'Sair',
      signedInAs: 'Conectado como',
      refreshBalance: 'Atualizar Saldo',
    },
    common: {
      status: {
        pending: 'Pendente',
        processing: 'Em processamento',
        approved: 'Aprovado',
        completed: 'Concluído',
        success: 'Sucesso',
        rejected: 'Rejeitado',
        failed: 'Falhou',
        canceled: 'Cancelado',
        draft: 'Rascunho',
        active: 'Ativo',
        deleted: 'Excluído',
        funding: 'Em captação',
        sold_out: 'Esgotado',
      },
      transactionTypes: {
        deposit: 'Depósito',
        withdrawal: 'Saque',
        sell: 'Venda',
        rent_distribution: 'Distribuição de Aluguel',
        buy: 'Compra',
      },
      actions: {
        edit: 'Editar',
        delete: 'Excluir',
        pasteFromClipboard: 'Colar da Área de Transferência',
        moveUp: 'Mover para Cima',
        moveDown: 'Mover para Baixo',
        remove: 'Remover',
        mainImage: 'Imagem Principal',
        setAsMain: 'Definir como Principal',
      },
      placeholders: {
        title: 'Título',
        description: 'Descrição',
        imageUrl: 'https://...',
        priceExample: '100k',
        tokensExample: '10k',
        monthlyYieldExample: '500',
        propertyTitle: 'Título do Imóvel',
        propertyDescription: 'Descrição do imóvel...',
        location: 'Cidade, País',
        priceUsd: '100000',
        totalTokens: '10000',
        yieldExample: '6-20% ou ~12% ou 10,5%',
        addressExample: 'ex.: 8a2f...',
      },
      images: {
        viewAlt: '{title} - Visão {index}',
        thumbnailAlt: 'Miniatura {index}',
        noImages: 'Nenhuma imagem disponível',
        previousImage: 'Imagem anterior',
        nextImage: 'Próxima imagem',
      },
    },
    home: {
      heroBadge: 'Tokenização Imobiliária',
      heroTitleLine1: 'Invista em Imóveis',
      heroTitleHighlight: 'Americanos',
      heroTitleLine2: 'a partir de $50',
      heroSubtitle:
        'Participe do futuro do investimento. Possua cotas fracionadas de imóveis de alto rendimento no blockchain. Receba aluguel mensal direto na sua carteira.',
      heroCtaPrimary: 'Ver Imóveis',
      heroCtaSecondary: 'Criar Conta',
      heroBackgroundAlt: 'Fundo com skyline da cidade',
      // --- PT-BR HOME DETAILS ---
      stats: {
        value: "Valor Patrimonial",
        investors: "Investidores",
        yield: "Rendimento Médio",
        onChain: "On-Chain"
      },
      features: {
        mainTitle: "Por que TerraVest?",
        mainSubtitle: "Removemos as barreiras de entrada. Sem bancos, sem papelada, sem taxas ocultas. Apenas propriedade pura.",
        rentTitle: "Visibilidade Mensal do Aluguel",
        rentDesc: "A renda de aluguel acumula diariamente com base em seus tokens e fica visível no seu painel no início de cada mês.",
        legalTitle: "Estrutura Legal nos EUA",
        legalDesc: "Cada propriedade é detida por uma LLC dedicada nos EUA. Os tokens representam direitos indiretos de propriedade, protegidos pela lei americana.",
        liquidityTitle: "Liquidez no Mercado Secundário",
        liquidityDesc: "Os tokens podem ser vendidos em mercados secundários suportados, oferecendo flexibilidade sem esperar meses pela venda do imóvel."
      },
      finalCta: {
        title: "Pronto para construir seu portfólio?",
        subtitle: "Comece a ganhar renda de aluguel diária com clareza mensal.",
        button: "Comece a Investir Agora"
      }
    },
    landing: {
      heroImageAlt: 'Skyline imobiliário de Miami',
      tokenizationImageAlt: 'Gráfico de tokenização',
    },
    marketplace: {
      heroBadge: 'Oportunidades Ativas',
      title: 'Imóveis dos EUA Selecionados',
      subtitle: 'Invista em imóveis premium a partir de $50.',
      searchPlaceholder: 'Buscar imóveis...',
      errorFallback: 'Falha ao carregar imóveis',
      emptyState: 'Nenhum imóvel encontrado.',
    },
    about: {
      heroTitle: 'Sobre a TerraVest',
      heroSubtitle:
        'A TerraVest cria uma forma mais simples e global de investir em imóveis geradores de renda por tokenização.',
      heroCtaMarketplace: 'Explorar Marketplace',
      heroCtaRegister: 'Criar Conta',
      introTitle: 'Uma Introdução a Imóveis Tokenizados',
      introP1:
        'A forma de investir em ativos evoluiu continuamente - de posse física a certificados em papel e agora sistemas digitais. A tokenização representa o próximo passo dessa evolução. Ao converter direitos de propriedade em tokens na blockchain, ativos reais podem ser acessados, transferidos e gerenciados com muito mais eficiência.',
      introP2:
        'Na TerraVest, aplicamos tokenização a imóveis de renda nos EUA. Isso torna a propriedade mais acessível, transparente e flexível para investidores no mundo todo.',
      introCta: 'Ver Imóveis Tokenizados',
      tokenizationTitle: 'O que é Tokenização de Ativos?',
      tokenizationP1:
        'Tokenização de ativos é o processo de converter direitos de um ativo real em um token digital na blockchain. Cada token representa uma parcela definida de propriedade e direitos econômicos associados. Esses tokens podem ser mantidos e transferidos com segurança em um livro digital global.',
      tokenizationP2:
        'No modelo da TerraVest, os imóveis pertencem a LLCs baseadas nos EUA. Os investidores detêm tokens que representam propriedade indireta nessas entidades, dando exposição a renda de aluguel sem a complexidade do investimento imobiliário tradicional internacional.',
      benefitsTitle: 'Por que Tokenização Importa',
      benefits: [
        {
          title: 'Transparência',
          desc: 'Registros de propriedade e transferências são imutáveis, aumentando clareza e confiança.',
        },
        {
          title: 'Liquidez',
          desc: 'Tokens fracionados tornam ativos antes ilíquidos mais fáceis de negociar e rebalancear.',
        },
        {
          title: 'Acesso Global',
          desc: 'Investidores do mundo todo podem acessar imóveis nos EUA sem fronteiras.',
        },
        {
          title: 'Menores Barreiras',
          desc: 'Investimentos mínimos menores permitem construir portfólio de forma gradual.',
        },
      ],
      midCta: 'Explorar Marketplace',
      reTitle: 'Imóveis, Reimaginados',
      reP1:
        'Imagine um imóvel de $100.000 dividido em 100 tokens. Cada token representa 1% do imóvel. Ao comprar tokens, investidores podem construir propriedade gradualmente - de uma pequena alocação a uma posição significativa - sem comprometer grandes valores de capital.',
      reP2:
        'Essa estrutura permite diversificar, ajustar exposição e acessar renda de aluguel com flexibilidade que o investimento tradicional muitas vezes não oferece.',
      finalCtaText:
        'Comece a investir em imóveis tokenizados com renda diária e visibilidade mensal.',
      finalCtaPrimary: 'Criar Conta',
      finalCtaSecondary: 'Explorar Marketplace',
      legalDisclosure:
        'A TerraVest oferece acesso a investimentos imobiliários tokenizados por meio de LLCs nos EUA. Investimentos envolvem risco, incluindo perda de capital, vacância, flutuações de mercado e mudanças regulatórias. Renda de aluguel não é garantida e desempenho passado não garante resultados futuros. Nada neste site constitui aconselhamento financeiro.',
    },
    learn: {
      heroTitle: 'Aprenda Como a TerraVest Funciona',
      heroSubtitle:
        'Ganhe renda diária de aluguel de imóveis nos EUA - com visibilidade mensal no painel.',
      heroCtaMarketplace: 'Marketplace',
      heroCtaRegister: 'Criar Conta',
      whatIsTitle: 'O que é a TerraVest?',
      whatIsLink: 'Sobre a TerraVest',
      whatIsItems: [
        {
          title: 'O que é a TerraVest?',
          desc: 'A TerraVest é uma plataforma de investimento imobiliário que tokeniza imóveis de renda nos EUA. Cada imóvel é de uma LLC nos EUA e é dividido em tokens digitais, permitindo fracionar a propriedade em vez de comprar imóveis inteiros.',
        },
        {
          title: 'Feita para Investidores Globais',
          desc: 'A TerraVest é projetada para investidores internacionais que querem exposição ao mercado imobiliário dos EUA sem residência, bancos locais ou burocracia.',
        },
        {
          title: 'Baixo Mínimo',
          desc: 'Ao fracionar a propriedade, a TerraVest reduz a barreira de entrada. Investidores podem começar com valores menores.',
        },
      ],
      whoCanInvestTitle: 'Quem Pode Investir?',
      whoCanInvestLink: 'Registrar',
      whoCanInvestItems: [
        'Aberto para investidores da maioria dos países.',
        'Não exige visto, residência ou conta bancária nos EUA.',
        'Restrições de conformidade se aplicam a jurisdições sancionadas ou de alto risco.',
        'Ideal para investidores fora dos EUA buscando renda em dólar.',
      ],
      processTitle: 'Como Funciona o Investimento',
      processSubtitle:
        'Tokens geram aluguel diariamente. Ganhos são agregados e exibidos no painel no início de cada mês.',
      processSteps: [
        {
          title: '1. Explore o Marketplace',
          desc: 'Veja imóveis de aluguel nos EUA. Cada anúncio mostra rendimento esperado, detalhes e estrutura legal.',
        },
        {
          title: '2. Compre Tokens',
          desc: 'Ao investir, você compra tokens que representam propriedade fracionada em uma LLC.',
        },
        {
          title: '3. Acúmulo Diário',
          desc: 'Renda de aluguel acumula diariamente com base na quantidade de tokens.',
        },
        {
          title: '4. Pagamento Mensal',
          desc: 'No início de cada mês, o aluguel acumulado fica visível no painel.',
        },
      ],
      processCta: 'Ver Marketplace',
      walletTitle: 'Carteira, Segurança e Fluxo de Renda',
      walletItems: [
        {
          title: 'Carteira do Investidor',
          desc: 'Guarde tokens e renda em um só lugar. Use a carteira integrada ou conecte a sua.',
        },
        {
          title: 'Uso Flexível da Renda',
          desc: 'Quando o aluguel aparece no painel, você pode sacar ou reinvestir.',
        },
        {
          title: 'Segurança e Controle',
          desc: 'Arquitetura não custodial e autenticação forte, sem guardar chaves privadas.',
        },
      ],
      feesTitle: 'Taxas e Transparência',
      fees: [
        {
          title: 'Taxa de Negociação',
          rate: '1.5%',
          desc: 'Aplicada ao comprar ou vender tokens. Cobre operações, estrutura legal e compliance.',
        },
        {
          title: 'Gestão de Propriedades',
          rate: '10%',
          desc: 'Deduzida da renda antes da distribuição. Cobre manutenção, seguro e impostos.',
        },
        {
          title: 'Taxa de Saque',
          rate: '$5 + 1%',
          desc: 'Aplica-se ao transferir fundos para carteira externa.',
        },
      ],
      glossaryTitle: 'Glossário',
      glossary: [
        {
          term: 'Imóveis Tokenizados',
          def: 'Estrutura em que a propriedade é representada por tokens na blockchain.',
        },
        {
          term: 'Acúmulo Diário',
          def: 'Renda calculada e acumulada diariamente com base nos tokens.',
        },
        {
          term: 'LLC dos EUA',
          def: 'Entidade legal que detém o título do imóvel e limita responsabilidade.',
        },
      ],
      legalTitle: 'Divulgação Legal e de Risco',
      legalDesc:
        'A TerraVest oferece acesso a investimentos imobiliários tokenizados. Investir envolve riscos, incluindo flutuações de mercado, vacância, despesas e mudanças regulatórias. Renda não é garantida e desempenho passado não garante resultados futuros. Tokens representam propriedade indireta por meio de LLCs e não constituem valores mobiliários ou aconselhamento financeiro.',
      finalCtaText: 'Comece a ganhar renda diária com visibilidade mensal.',
      finalCtaMarketplace: 'Marketplace',
      finalCtaRegister: 'Criar Conta',
    },
    dashboard: {
      redirecting: 'Carregando...',
      title: 'Meu Portfólio',
      welcomeBack: 'Bem-vindo de volta',
      totalNetWorth: 'Patrimônio Total',
      withdraw: 'Sacar',
      cashBalance: 'Saldo em Caixa',
      assetValue: 'Valor dos Ativos',
      unclaimedRent: 'Aluguel não Resgatado',
      rewards: 'Recompensas',
      rewardsSubtitle: 'Acumulado de aluguéis',
      claimToWallet: 'Resgatar para Carteira',
      assetsTitle: 'Seus Ativos',
      assetsEmpty: 'Nenhum ativo encontrado. Comece no Marketplace!',
      active: 'Ativo',
      tokensOwned: 'Tokens Possuídos',
      currentValue: 'Valor Atual',
      sellTokens: 'Vender Tokens',
      sellModalTitle: 'Vender Tokens',
      availableTokens: 'Tokens Disponíveis:',
      pricePerToken: 'Preço por Token:',
      amountToSell: 'Quantidade para Vender',
      sellAmountPlaceholder: '0',
      proceedsNote:
        'Os valores (menos taxa de 1.5%) serão adicionados ao seu saldo em USD imediatamente.',
      confirmSale: 'Confirmar Venda',
      claimModalTitle: 'Resgatar Recompensas',
      claimModalSubtitle: 'Mover aluguel acumulado para sua carteira.',
      totalAmount: 'Total',
      confirmAddToBalance: 'Confirmar e Adicionar ao Saldo',
      withdrawModalTitle: 'Sacar Fundos',
      withdrawModalSubtitle: 'Transferir saldo em USD para sua carteira Bitcoin.',
      availableCash: 'Saldo Disponível:',
      amountToWithdrawLabel: 'Valor para Sacar (USD)',
      amountToWithdrawPlaceholder: 'Min $50',
      insufficientFunds: 'Saldo insuficiente',
      withdrawalAmountLabel: 'Valor do Saque:',
      processingFeeLabel: 'Taxa de Processamento ($5 + 1%):',
      youWillReceive: 'Você recebera:',
      destinationBtcAddress: 'Endereço BTC de Destino',
      btcPlaceholder: 'bc1q...',
      requestWithdrawal: 'Solicitar Saque',
      toastSellSuccess: 'Ativo vendido! Fundos adicionados ao saldo USD.',
      toastClaimSuccess: 'Resgatado ${amount} para seu saldo!',
      toastMinWithdrawal: 'Saque mínimo e $50',
      toastInsufficientCash: 'Saldo insuficiente',
      toastInvalidBtc: 'Endereço BTC inválido',
      toastWithdrawRequest: 'Solicitação de saque enviada! Aguardando aprovação.',
    },
    footer: {
      disclaimerText: 'Este site é fornecido apenas para fins informativos e não constitui uma oferta de venda ou uma solicitação de compra de quaisquer valores mobiliários ou produtos de investimento. O desempenho passado não é indicativo de resultados futuros.',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Serviço',
      disclaimer: 'Aviso Legal',
      contact: 'Contato',
    },
    transactionHistory: {
      title: 'Histórico de Transações',
      refreshTitle: 'Atualizar',
      columnType: 'Tipo',
      columnDate: 'Data',
      columnAmount: 'Valor',
      columnInfo: 'Info',
      columnStatus: 'Status',
      columnExplorer: 'Explorador',
      loading: 'Carregando transações...',
      errorTitle: 'Não foi possível carregar as transações.',
      errorFallback: 'Erro de rede',
      empty: 'Nenhuma transação encontrada.',
      viewTx: 'Ver TX',
      viewAddress: 'Endereço',
    },
    depositModal: {
      title: 'Depositar Fundos',
      subtitle: 'Adicione USD à sua carteira via Bitcoin.',
      amountLabel: 'Valor para Depositar (USD)',
      amountPlaceholder: '100',
      estPaymentLabel: 'Pagamento Est.:',
      minDepositNote:
        'O depósito mínimo é {min}. Seu saldo será atualizado automaticamente após 1 confirmação de rede.',
      submitLoading: 'Gerando endereço...',
      submitContinue: 'Continuar',
      toastMinimumDeposit: 'Depósito mínimo é {min}',
      toastAddressGenerated: 'Endereço de depósito gerado!',
      toastSessionError:
        'Não foi possível ler a sessão. Atualize a página e faça login novamente.',
      toastCreateOrderFailed: 'Falha ao criar o pedido. O backend está rodando?',
    },
    settings: {
      title: 'Configurações da Conta',
      subtitle: 'Gerencie sua segurança, preferencias e status verificado.',
      verifiedInvestor: 'Investidor Verificado',
      accountLimits: 'Limites da Conta',
      depositLimit: 'Limite de Deposito',
      depositLimitValue: '$50,000 / mês',
      withdrawalLimit: 'Limite de Saque',
      withdrawalLimitValue: '$100,000 / mês',
      requestHigherLimits: 'Solicitar Limites Maiores',
      notificationsTitle: 'Notificações',
      notificationsSubtitle: 'Gerencie como nos comunicamos com você.',
      emailAlerts: 'Alertas de E-mail',
      emailAlertsDesc: 'Receba e-mails transacionais',
      securityAlerts: 'Alertas de Segurança',
      securityAlertsDesc: 'Tentativas de login e mudanças de senha',
      securityTitle: 'Segurança',
      securitySubtitle: 'Atualize sua senha e configurações de segurança.',
      passwordPlaceholder: '********',
      newPassword: 'Nova Senha',
      confirmNewPassword: 'Confirmar Nova Senha',
      updatePassword: 'Atualizar Senha',
      withdrawalAddressTitle: 'Endereço de Saque',
      withdrawalAddressSubtitle: 'Salve seu endereço BTC padrão.',
      withdrawalAddressPlaceholder: 'Digite o endereço BTC (bc1q...)',
      edit: 'Editar',
      dangerZoneTitle: 'Zona de Perigo',
      dangerZoneText:
        'Depois de excluir sua conta, não há volta. Tenha certeza.',
      deleteAccount: 'Excluir Conta',
      toastPasswordTooShort: 'A senha deve ter pelo menos 8 caracteres.',
      toastPasswordMismatch: 'As senhas não conferem.',
      toastPasswordUpdated: 'Senha atualizada com sucesso!',
      toastPasswordUpdateFailed: 'Falha ao atualizar senha',
      toastPreferenceUpdated: 'Preferência atualizada',
      toastInvalidAddress: 'Endereço inválido',
      toastAddressSaved: 'Endereço de saque salvo!',
    },
    auth: {
      loginTitle: 'TerraVest',
      loginTitlePrefix: 'Terra',
      loginTitleBrand: 'Vest',
      loginSubtitle: 'Entre para acessar seu portfólio',
      loginIdentifierPlaceholder: 'E-mail ou Usuário',
      loginPasswordPlaceholder: 'Senha',
      rememberMe: 'Lembrar',
      forgotPassword: 'Esqueci a senha',
      loginButton: 'Entrar',
      loginButtonLoading: 'Carregando...',
      loginNoAccount: 'Não tem conta?',
      loginRegisterLink: 'Registrar',
      loginBotError: 'Confirme que você não é um robô',
      loginWelcome: 'Bem-vindo de volta!',
      loginFailed: 'Login malsucedido',
      loginSecurityError: 'Falha ao carregar verificação.',
      registerTitlePrefix: 'Junte-se a',
      registerTitleBrand: 'TerraVest',
      registerSubtitle: 'Crie sua conta para começar a investir',
      registerBullet1: 'Ganhe aluguel diário, visível mensalmente',
      registerBullet2: 'Imóveis com LLC nos EUA',
      registerBullet3: 'Comece com $50 - sem bancos, sem papelada',
      registerUsernamePlaceholder: 'Usuário',
      registerUsernameHint:
        'Nome público. Deve ser único - pode ser alterado depois.',
      registerEmailPlaceholder: 'Endereço de E-mail',
      registerPasswordPlaceholder: 'Senha',
      registerConfirmPasswordPlaceholder: 'Confirmar Senha',
      registerPasswordRequirementsTitle: 'Requisitos de Senha:',
      registerRequirementLength: 'Pelo menos 8 caracteres',
      registerRequirementUpper: 'Pelo menos uma letra maiúscula (A-Z)',
      registerRequirementLower: 'Pelo menos uma letra minúscula (a-z)',
      registerRequirementNumber: 'Pelo menos um número (0-9)',
      registerRequirementSpecial: 'Pelo menos um caractere especial (!@#$)',
      registerButton: 'Criar Conta',
      registerButtonLoading: 'Criando conta...',
      registerTerms:
        'Ao criar uma conta, você reconhece que investimentos imobiliários tokenizados envolvem risco.',
      registerTermsLink: 'Saiba mais',
      registerTrustedBy: 'Confiado por investidores de 40+ países',
      registerHaveAccount: 'Já tem conta?',
      registerLoginLink: 'Entrar',
      toastRegisterMismatch: 'As senhas não conferem.',
      toastRegisterRequirements: 'Atenda todos os requisitos de senha.',
      toastRegisterCreated: 'Conta criada com sucesso!',
      toastRegisterSuccessLogin: 'Registro concluído! Faça login.',
      email_verification_required: 'Verifique seu e-mail para continuar',
      email_verification_sent: 'E-mail de verificação enviado. Verifique sua caixa de entrada.',
      email_verification_pending_body:
        'Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta.',
      email_verification_resend: 'Reenviar e-mail de verificação',
      email_verification_resend_loading: 'Enviando e-mail de verificação...',
      email_verification_resend_failed: 'Falha ao reenviar o e-mail de verificação.',
      email_verification_resend_missing: 'Informe seu e-mail para reenviar a verificação.',
      email_verification_title: 'Verificação de e-mail',
      email_verification_loading: 'Verificando seu e-mail...',
      email_verification_success: 'E-mail verificado com sucesso.',
      email_verification_expired: 'O link de verificação é inválido ou expirou.',
      email_verification_login: 'Ir para login',
      email_not_verified_error: 'Verifique seu e-mail antes de entrar.',
    },
    legal: {
      lastUpdated: 'Última atualização: 21 de Janeiro de 2026',
      privacy: {
        title: 'Política de Privacidade',
        intro: 'A TerraVest ("nós", "nosso") respeita sua privacidade e compromete-se a proteger as informações pessoais que você compartilha conosco.',
        sections: [
          { title: '1. Informações que Coletamos', content: ['Endereço de e-mail', 'Nome e dados básicos', 'Informações de registro', 'Dados técnicos (IP, navegador)'] },
          { title: '2. Como Usamos', content: ['Fornecer acesso à plataforma', 'Comunicar atualizações', 'Responder a solicitações', 'Melhorar serviços', 'Cumprir requisitos legais'] },
          { title: '3. Segurança de Dados', content: 'Implementamos salvaguardas administrativas e técnicas razoáveis para proteger suas informações.' },
          { title: '4. Seus Direitos', content: ['Acessar, corrigir ou excluir dados', 'Retirar consentimento', 'Solicitar informações sobre processamento'] }
        ]
      },
      terms: {
        title: 'Termos de Serviço',
        intro: 'Ao acessar ou usar os serviços da TerraVest, você concorda com os seguintes Termos de Serviço.',
        sections: [
          { title: '1. Propósito da Plataforma', content: 'A TerraVest fornece uma plataforma tecnológica para apresentar conteúdo informativo sobre imóveis tokenizados. Nada neste site constitui aconselhamento jurídico ou financeiro.' },
          { title: '2. Elegibilidade', content: 'Você é responsável por garantir que seu uso da TerraVest esteja em conformidade com as leis de sua jurisdição.' },
          { title: '3. Nenhuma Oferta de Investimento', content: 'A TerraVest não oferece valores mobiliários nem atua como corretora ou consultora de investimentos nesta plataforma.' },
          { title: '4. Limitação de Responsabilidade', content: 'A TerraVest não será responsável por danos indiretos ou consequentes decorrentes do uso da plataforma.' }
        ]
      },
      disclaimer: {
        title: 'Aviso Legal Geral',
        introBox: 'As informações fornecidas na TerraVest são apenas para fins educacionais e informativos.',
        introText: 'O conteúdo deste site não constitui aconselhamento de investimento, financeiro, jurídico ou fiscal.',
        bullets: [
          'Sem Aconselhamento: Busque consultoria profissional.',
          'Aviso de Risco: Tokenização envolve alto risco.',
          'Sem Garantias: Desempenho passado não indica resultados futuros.'
        ],
        closing: 'Você deve consultar seus próprios consultores jurídicos e financeiros antes de tomar decisões.'
      }
    },
    contactPage: {
      title: 'Fale Conosco',
      subtitle: 'Dúvidas sobre tokenização imobiliária? Nossa equipe está aqui para ajudar.',
      emailTitle: 'Suporte por E-mail',
      emailDesc: 'Para dúvidas gerais e suporte:',
      chatTitle: 'Chat Ao Vivo',
      chatDesc: 'Disponível dias úteis das 9h às 18h EST.',
      officeTitle: 'Escritório',
      officeDesc: '100 Biscayne Blvd, Miami, FL 33132',
      formTitle: 'Envie uma mensagem',
      form: {
        firstName: 'Nome',
        lastName: 'Sobrenome',
        email: 'Endereço de E-mail',
        subject: 'Assunto',
        message: 'Mensagem',
        submit: 'Enviar Mensagem'
      }
    },
    propertyDetails: {
      notFound: 'Imóvel não encontrado.',
      backToMarketplace: 'Voltar ao Marketplace',
      backToMarket: 'Voltar ao Mercado',
      tokenizedAsset: 'Ativo Tokenizado',
      estYield: 'Rendimento Est.',
      investmentSummary: 'Resumo do Investimento',
      propertyHighlights: 'Destaques do Imóvel',
      highlight1: 'Imóvel totalmente gerenciado',
      highlight2: 'Pagamentos mensais de aluguel',
      highlight3: 'Alto potencial de valorização',
      highlight4: 'Propriedade legal via LLC',
      investTitle: 'Invista neste Ativo',
      investSubtitle: 'Propriedade instantânea via tokens TerraVest',
      tokenPrice: 'Preço do Token',
      available: 'Disponível',
      amountTokens: 'Quantidade (Tokens)',
      tokensLabel: 'Tokens',
      total: 'Total:',
      loginToInvest: 'Você precisa estar logado para investir.',
      confirmInvestment: 'Confirmar Investimento',
      secureTransaction: 'Transação segura via TerraVest',
      assetValue: 'Valor do Ativo',
      totalTokens: 'Total de Tokens',
      orderCreated: 'Pedido criado! Va ao painel para concluir o pagamento.',
      orderFailed: 'Falha ao criar pedido.',
      loginToInvestButton: 'Entrar para Investir',
      locationFallback: 'Estados Unidos',
      notAvailable: 'N/D',
    },
  },
  es: {
    navbar: {
      marketplace: 'Marketplace',
      about: 'Acerca de',
      learn: 'Aprender',
      login: 'Iniciar Sesión',
      register: 'Comenzar',
      account: 'Mi Cuenta',
      dashboard: 'Panel',
      adminPanel: 'Panel Admin',
      settings: 'Configuracion',
      balance: 'Saldo',
      walletBalance: 'Saldo de la Billetera',
      deposit: 'Depositar',
      logout: 'Cerrar Sesión',
      signedInAs: 'Conectado como',
      refreshBalance: 'Actualizar Saldo',
    },
    common: {
      status: {
        pending: 'Pendiente',
        processing: 'En proceso',
        approved: 'Aprobado',
        completed: 'Completado',
        success: 'Éxito',
        rejected: 'Rechazado',
        failed: 'Fallido',
        canceled: 'Cancelado',
        draft: 'Borrador',
        active: 'Activo',
        deleted: 'Eliminado',
        funding: 'En financiamiento',
        sold_out: 'Agotado',
      },
      transactionTypes: {
        deposit: 'Depósito',
        withdrawal: 'Retiro',
        sell: 'Venta',
        rent_distribution: 'Distribución de Renta',
        buy: 'Compra',
      },
      actions: {
        edit: 'Editar',
        delete: 'Eliminar',
        pasteFromClipboard: 'Pegar desde el portapapeles',
        moveUp: 'Mover arriba',
        moveDown: 'Mover abajo',
        remove: 'Quitar',
        mainImage: 'Imagen Principal',
        setAsMain: 'Establecer como Principal',
      },
      placeholders: {
        title: 'Título',
        description: 'Descripción',
        imageUrl: 'https://...',
        priceExample: '100k',
        tokensExample: '10k',
        monthlyYieldExample: '500',
        propertyTitle: 'Título de la Propiedad',
        propertyDescription: 'Descripción de la propiedad...',
        location: 'Ciudad, País',
        priceUsd: '100000',
        totalTokens: '10000',
        yieldExample: '6-20% o ~12% o 10.5%',
        addressExample: 'ej. 8a2f...',
      },
      images: {
        viewAlt: '{title} - Vista {index}',
        thumbnailAlt: 'Miniatura {index}',
        noImages: 'No hay imágenes disponibles',
        previousImage: 'Imagen anterior',
        nextImage: 'Siguiente imagen',
      },
    },
    home: {
      heroBadge: 'Tokenización Inmobiliaria',
      heroTitleLine1: 'Invierte en',
      heroTitleHighlight: 'Bienes Raíces',
      heroTitleLine2: 'de Estados Unidos desde $50',
      heroSubtitle:
        'Únete al futuro de la inversión. Posee fracciones de propiedades de alto rendimiento en la blockchain. Recibe renta mensual directo en tu billetera.',
      heroCtaPrimary: 'Ver Propiedades',
      heroCtaSecondary: 'Crear Cuenta',
      heroBackgroundAlt: 'Fondo con skyline de la ciudad',
      // --- ES HOME DETAILS ---
      stats: {
        value: "Valor de Propiedad",
        investors: "Inversores",
        yield: "Rendimiento Prom.",
        onChain: "En Cadena"
      },
      features: {
        mainTitle: "¿Por qué TerraVest?",
        mainSubtitle: "Hemos eliminado las barreras de entrada. Sin bancos, sin papeleo, sin tarifas ocultas. Solo propiedad pura.",
        rentTitle: "Visibilidad Mensual de Renta",
        rentDesc: "Los ingresos de alquiler se acumulan diariamente según tus tokens y son visibles en tu panel al comienzo de cada mes.",
        legalTitle: "Estructura Legal de EE.UU.",
        legalDesc: "Cada propiedad es poseída por una LLC dedicada de EE.UU. Los tokens representan derechos de propiedad indirecta, protegidos por la ley estadounidense.",
        liquidityTitle: "Liquidez del Mercado Secundario",
        liquidityDesc: "Los tokens se pueden vender en mercados secundarios soportados, dándote flexibilidad sin esperar meses para una venta de propiedad."
      },
      finalCta: {
        title: "¿Listo para construir tu portafolio?",
        subtitle: "Comienza a ganar ingresos de alquiler diarios con claridad mensual.",
        button: "Empieza a Invertir Ahora"
      }
    },
    landing: {
      heroImageAlt: 'Skyline inmobiliario de Miami',
      tokenizationImageAlt: 'Gráfico de tokenización',
    },
    marketplace: {
      heroBadge: 'Oportunidades Activas',
      title: 'Propiedades de EE.UU. Curadas',
      subtitle: 'Invierte en bienes raíces premium desde $50.',
      searchPlaceholder: 'Buscar propiedades...',
      errorFallback: 'No se pudieron cargar las propiedades',
      emptyState: 'No se encontraron propiedades.',
    },
    about: {
      heroTitle: 'Sobre TerraVest',
      heroSubtitle:
        'TerraVest esta construyendo una forma mas simple y global de invertir en bienes raíces con ingresos mediante tokenización.',
      heroCtaMarketplace: 'Explorar Marketplace',
      heroCtaRegister: 'Crear Cuenta',
      introTitle: 'Una Introducción a Bienes Raíces Tokenizados',
      introP1:
        'La forma en que las personas invierten en activos ha evolucionado - de la propiedad física a certificados en papel y ahora sistemas digitales. La tokenización representa el siguiente paso. Al convertir derechos de propiedad en tokens en la blockchain, los activos reales pueden accederse y transferirse con mayor eficiencia.',
      introP2:
        'En TerraVest aplicamos tokenización a bienes raíces de renta en EE.UU. Esto hace la propiedad más accesible, transparente y flexible para inversores globales.',
      introCta: 'Ver Propiedades Tokenizadas',
      tokenizationTitle: 'Qué es la Tokenización de Activos?',
      tokenizationP1:
        'La tokenización de activos es el proceso de convertir derechos sobre un activo real en un token digital en una blockchain. Cada token representa una parte definida de propiedad y derechos económicos asociados.',
      tokenizationP2:
        'En el modelo de TerraVest, las propiedades son de LLCs en EE.UU. Los inversores poseen tokens que representan propiedad indirecta en estas entidades, con exposición a renta sin la complejidad tradicional.',
      benefitsTitle: 'Por qué Importa la Tokenización',
      benefits: [
        {
          title: 'Transparencia',
          desc: 'Registros de propiedad y transferencias quedan inmutables, aumentando claridad y confianza.',
        },
        {
          title: 'Liquidez',
          desc: 'Tokens fraccionados hacen activos ilíquidos más fáciles de negociar.',
        },
        {
          title: 'Acceso Global',
          desc: 'Inversores de todo el mundo pueden acceder a bienes raíces de EE.UU.',
        },
        {
          title: 'Menores Barreras',
          desc: 'Mínimos más bajos permiten construir portafolio gradualmente.',
        },
      ],
      midCta: 'Explorar Marketplace',
      reTitle: 'Bienes Raíces, Reimaginados',
      reP1:
        'Imagina una propiedad de $100,000 dividida en 100 tokens. Cada token representa 1% de la propiedad. Al comprar tokens, los inversores pueden construir propiedad gradualmente sin comprometer grandes cantidades.',
      reP2:
        'Esta estructura permite diversificar, ajustar exposición y acceder a renta con flexibilidad.',
      finalCtaText:
        'Empieza a invertir en bienes raíces tokenizados con ingresos diarios y visibilidad mensual.',
      finalCtaPrimary: 'Crear Cuenta',
      finalCtaSecondary: 'Explorar Marketplace',
      legalDisclosure:
        'TerraVest brinda acceso a inversiones inmobiliarias tokenizadas mediante LLCs en EE.UU. Las inversiones tienen riesgos, incluida pérdida de capital, vacancia, fluctuaciones y cambios regulatorios. La renta no está garantizada.',
    },
    learn: {
      heroTitle: 'Aprende Cómo Funciona TerraVest',
      heroSubtitle:
        'Gana renta diaria de bienes raíces en EE.UU. - con visibilidad mensual en tu panel.',
      heroCtaMarketplace: 'Marketplace',
      heroCtaRegister: 'Crear Cuenta',
      whatIsTitle: 'Qué es TerraVest?',
      whatIsLink: 'Sobre TerraVest',
      whatIsItems: [
        {
          title: 'Qué es TerraVest?',
          desc: 'TerraVest es una plataforma que tokeniza propiedades de renta en EE.UU. Cada propiedad es de una LLC y se divide en tokens digitales.',
        },
        {
          title: 'Hecho para Inversores Globales',
          desc: 'TerraVest está diseñado para inversores internacionales sin residencia en EE.UU. ni bancos locales.',
        },
        {
          title: 'Mínimos Bajos',
          desc: 'La fraccionalización reduce la barrera de entrada y permite comenzar con montos pequeños.',
        },
      ],
      whoCanInvestTitle: 'Quién Puede Invertir?',
      whoCanInvestLink: 'Registrarse',
      whoCanInvestItems: [
        'Abierto a inversores de la mayoría de países.',
        'No se requiere visa de EE.UU. ni cuenta bancaria estadounidense.',
        'Restricciones de cumplimiento aplican a jurisdicciones sancionadas.',
        'Ideal para inversores no estadounidenses que buscan renta en dólares.',
      ],
      processTitle: 'Cómo Funciona la Inversión',
      processSubtitle:
        'Los tokens generan renta diaria. Las ganancias se muestran en el panel al inicio de cada mes.',
      processSteps: [
        {
          title: '1. Explora el Marketplace',
          desc: 'Explora propiedades de renta en EE.UU. con rendimiento esperado y estructura legal.',
        },
        {
          title: '2. Compra Tokens',
          desc: 'Al invertir, compras tokens que representan propiedad fraccionada en una LLC.',
        },
        {
          title: '3. Acumulacion Diaria',
          desc: 'La renta se acumula diariamente segun tus tokens.',
        },
        {
          title: '4. Pago Mensual',
          desc: 'Al inicio del mes, la renta acumulada aparece en tu panel.',
        },
      ],
      processCta: 'Ver Marketplace',
      walletTitle: 'Billetera, Seguridad y Flujo de Renta',
      walletItems: [
        {
          title: 'Billetera del Inversor',
          desc: 'Guarda tokens y renta en un solo lugar.',
        },
        {
          title: 'Uso Flexible de la Renta',
          desc: 'Cuando la renta aparece, puedes retirar o reinvertir.',
        },
        {
          title: 'Seguridad y Control',
          desc: 'Arquitectura no custodial y autenticacion fuerte.',
        },
      ],
      feesTitle: 'Tarifas y Transparencia',
      fees: [
        {
          title: 'Tarifa de Trading',
          rate: '1.5%',
          desc: 'Aplicada al comprar o vender tokens.',
        },
        {
          title: 'Gestion de Propiedades',
          rate: '10%',
          desc: 'Deducida de la renta antes de distribuirse.',
        },
        {
          title: 'Tarifa de Retiro',
          rate: '$5 + 1%',
          desc: 'Solo al transferir fondos a una billetera externa.',
        },
      ],
      glossaryTitle: 'Glosario',
      glossary: [
        {
          term: 'Bienes Raíces Tokenizados',
          def: 'Estructura donde la propiedad se representa con tokens en blockchain.',
        },
        {
          term: 'Acumulacion Diaria',
          def: 'La renta se calcula y acumula diariamente.',
        },
        {
          term: 'LLC de EE.UU.',
          def: 'Entidad legal que posee la propiedad y limita la responsabilidad.',
        },
      ],
      legalTitle: 'Aviso Legal y de Riesgo',
      legalDesc:
        'TerraVest brinda acceso a inversiones inmobiliarias tokenizadas. Invertir conlleva riesgos, incluidas fluctuaciones, vacancia y cambios regulatorios. La renta no está garantizada.',
      finalCtaText: 'Comienza a ganar renta diaria con visibilidad mensual.',
      finalCtaMarketplace: 'Marketplace',
      finalCtaRegister: 'Crear Cuenta',
    },
    dashboard: {
      redirecting: 'Cargando...',
      title: 'Mi Portafolio',
      welcomeBack: 'Bienvenido de nuevo',
      totalNetWorth: 'Patrimonio Total',
      withdraw: 'Retirar',
      cashBalance: 'Saldo en Efectivo',
      assetValue: 'Valor de Activos',
      unclaimedRent: 'Renta no Reclamada',
      rewards: 'Recompensas',
      rewardsSubtitle: 'Acumulado de rentas',
      claimToWallet: 'Reclamar a Billetera',
      assetsTitle: 'Tus Activos',
      assetsEmpty: 'No hay activos. Comienza en el Marketplace.',
      active: 'Activo',
      tokensOwned: 'Tokens Poseidos',
      currentValue: 'Valor Actual',
      sellTokens: 'Vender Tokens',
      sellModalTitle: 'Vender Tokens',
      availableTokens: 'Tokens Disponibles:',
      pricePerToken: 'Precio por Token:',
      amountToSell: 'Cantidad a Vender',
      sellAmountPlaceholder: '0',
      proceedsNote:
        'Los fondos (menos 1.5%) se agregaran a tu saldo USD inmediatamente.',
      confirmSale: 'Confirmar Venta',
      claimModalTitle: 'Reclamar Recompensas',
      claimModalSubtitle: 'Mueve la renta acumulada a tu billetera.',
      totalAmount: 'Total',
      confirmAddToBalance: 'Confirmar y Agregar al Saldo',
      withdrawModalTitle: 'Retirar Fondos',
      withdrawModalSubtitle: 'Transferir saldo USD a tu billetera Bitcoin.',
      availableCash: 'Saldo Disponible:',
      amountToWithdrawLabel: 'Monto a Retirar (USD)',
      amountToWithdrawPlaceholder: 'Min $50',
      insufficientFunds: 'Fondos insuficientes',
      withdrawalAmountLabel: 'Monto de Retiro:',
      processingFeeLabel: 'Tarifa de Procesamiento ($5 + 1%):',
      youWillReceive: 'Recibiras:',
      destinationBtcAddress: 'Dirección BTC de Destino',
      btcPlaceholder: 'bc1q...',
      requestWithdrawal: 'Solicitar Retiro',
      toastSellSuccess: 'Activo vendido! Fondos agregados al saldo USD.',
      toastClaimSuccess: 'Reclamado ${amount} a tu saldo!',
      toastMinWithdrawal: 'El retiro mínimo es $50',
      toastInsufficientCash: 'Saldo insuficiente',
      toastInvalidBtc: 'Dirección BTC invalida',
      toastWithdrawRequest: 'Solicitud de retiro enviada! Pendiente de aprobación.',
    },
    footer: {
      disclaimerText: 'Este sitio web se proporciona solo con fines informativos y no constituye una oferta de venta ni una solicitud de compra de valores o productos de inversión. El rendimiento pasado no es indicativo de resultados futuros.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      disclaimer: 'Aviso Legal',
      contact: 'Contacto',
    },
    transactionHistory: {
      title: 'Historial de Transacciones',
      refreshTitle: 'Actualizar',
      columnType: 'Tipo',
      columnDate: 'Fecha',
      columnAmount: 'Monto',
      columnInfo: 'Info',
      columnStatus: 'Estado',
      columnExplorer: 'Explorador',
      loading: 'Cargando transacciones...',
      errorTitle: 'No se pudieron cargar las transacciones.',
      errorFallback: 'Error de red',
      empty: 'No se encontraron transacciones.',
      viewTx: 'Ver TX',
      viewAddress: 'Dirección',
    },
    depositModal: {
      title: 'Depositar Fondos',
      subtitle: 'Agrega USD a tu billetera via Bitcoin.',
      amountLabel: 'Monto a Depositar (USD)',
      amountPlaceholder: '100',
      estPaymentLabel: 'Pago Est.:',
      minDepositNote:
        'El depósito mínimo es {min}. Tu saldo se actualizará automáticamente después de 1 confirmación de red.',
      submitLoading: 'Generando dirección...',
      submitContinue: 'Continuar',
      toastMinimumDeposit: 'El depósito mínimo es {min}',
      toastAddressGenerated: '¡Dirección de depósito generada!',
      toastSessionError:
        'No se pudo leer la sesión. Actualiza la página e inicia sesión de nuevo.',
      toastCreateOrderFailed:
        'No se pudo crear la orden. ¿El backend está en ejecución?',
    },
    settings: {
      title: 'Configuracion de Cuenta',
      subtitle: 'Administra seguridad, preferencias y estado verificado.',
      verifiedInvestor: 'Inversor Verificado',
      accountLimits: 'Limites de la Cuenta',
      depositLimit: 'Limite de Deposito',
      depositLimitValue: '$50,000 / mes',
      withdrawalLimit: 'Limite de Retiro',
      withdrawalLimitValue: '$100,000 / mes',
      requestHigherLimits: 'Solicitar Limites Mayores',
      notificationsTitle: 'Notificaciones',
      notificationsSubtitle: 'Gestiona como nos comunicamos contigo.',
      emailAlerts: 'Alertas de Email',
      emailAlertsDesc: 'Recibe emails transaccionales',
      securityAlerts: 'Alertas de Seguridad',
      securityAlertsDesc: 'Intentos de inicio y cambios de clave',
      securityTitle: 'Seguridad',
      securitySubtitle: 'Actualiza tu clave y configuracion.',
      passwordPlaceholder: '********',
      newPassword: 'Nueva Contraseña',
      confirmNewPassword: 'Confirmar Nueva Contraseña',
      updatePassword: 'Actualizar Contraseña',
      withdrawalAddressTitle: 'Dirección de Retiro',
      withdrawalAddressSubtitle: 'Guarda tu dirección BTC por defecto.',
      withdrawalAddressPlaceholder: 'Ingresa dirección BTC (bc1q...)',
      edit: 'Editar',
      dangerZoneTitle: 'Zona de Peligro',
      dangerZoneText:
        'Una vez que eliminas tu cuenta, no hay vuelta atras.',
      deleteAccount: 'Eliminar Cuenta',
      toastPasswordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
      toastPasswordMismatch: 'Las contraseñas no coinciden.',
      toastPasswordUpdated: 'Contraseña actualizada con éxito!',
      toastPasswordUpdateFailed: 'Fallo al actualizar contraseña',
      toastPreferenceUpdated: 'Preferencia actualizada',
      toastInvalidAddress: 'Dirección invalida',
      toastAddressSaved: 'Dirección de retiro guardada!',
    },
    auth: {
      loginTitle: 'TerraVest',
      loginTitlePrefix: 'Terra',
      loginTitleBrand: 'Vest',
      loginSubtitle: 'Inicia sesión para acceder a tu portafolio',
      loginIdentifierPlaceholder: 'Email o Usuario',
      loginPasswordPlaceholder: 'Contraseña',
      rememberMe: 'Recordarme',
      forgotPassword: 'Olvide mi contraseña',
      loginButton: 'Iniciar Sesión',
      loginButtonLoading: 'Cargando...',
      loginNoAccount: 'No tienes cuenta?',
      loginRegisterLink: 'Registrarse',
      loginBotError: 'Confirma que no eres un robot',
      loginWelcome: 'Bienvenido de nuevo!',
      loginFailed: 'Inicio fallido',
      loginSecurityError: 'Fallo al cargar la verificación.',
      registerTitlePrefix: 'Únete a',
      registerTitleBrand: 'TerraVest',
      registerSubtitle: 'Crea tu cuenta para comenzar a invertir',
      registerBullet1: 'Gana renta diaria, visible mensualmente',
      registerBullet2: 'Propiedades con LLC en EE.UU.',
      registerBullet3: 'Comienza desde $50 - sin bancos, sin papeleo',
      registerUsernamePlaceholder: 'Usuario',
      registerUsernameHint:
        'Nombre público. Debe ser único - se puede cambiar luego.',
      registerEmailPlaceholder: 'Correo Electrónico',
      registerPasswordPlaceholder: 'Contraseña',
      registerConfirmPasswordPlaceholder: 'Confirmar Contraseña',
      registerPasswordRequirementsTitle: 'Requisitos de Contraseña:',
      registerRequirementLength: 'Al menos 8 caracteres',
      registerRequirementUpper: 'Al menos una mayuscula (A-Z)',
      registerRequirementLower: 'Al menos una minúscula (a-z)',
      registerRequirementNumber: 'Al menos un número (0-9)',
      registerRequirementSpecial: 'Al menos un caracter especial (!@#$)',
      registerButton: 'Crear Cuenta',
      registerButtonLoading: 'Creando cuenta...',
      registerTerms:
        'Al crear una cuenta, reconoces que las inversiones tokenizadas conllevan riesgo.',
      registerTermsLink: 'Aprende mas',
      registerTrustedBy: 'Confiado por inversores de 40+ países',
      registerHaveAccount: 'Ya tienes cuenta?',
      registerLoginLink: 'Iniciar Sesión',
      toastRegisterMismatch: 'Las contraseñas no coinciden.',
      toastRegisterRequirements: 'Cumple todos los requisitos de contraseña.',
      toastRegisterCreated: 'Cuenta creada con éxito!',
      toastRegisterSuccessLogin: 'Registro exitoso! Inicia sesión.',
      email_verification_required: 'Verifica tu correo para continuar',
      email_verification_sent: 'Se envió un correo de verificación. Revisa tu bandeja de entrada.',
      email_verification_pending_body:
        'Enviamos un enlace de verificación a tu correo. Haz clic para activar tu cuenta.',
      email_verification_resend: 'Reenviar correo de verificación',
      email_verification_resend_loading: 'Enviando correo de verificación...',
      email_verification_resend_failed: 'No se pudo reenviar el correo de verificación.',
      email_verification_resend_missing: 'Ingresa tu correo para reenviar la verificación.',
      email_verification_title: 'Verificación de correo',
      email_verification_loading: 'Verificando tu correo...',
      email_verification_success: 'Correo verificado correctamente.',
      email_verification_expired: 'El enlace de verificación es inválido o venció.',
      email_verification_login: 'Ir a iniciar sesión',
      email_not_verified_error: 'Verifica tu correo antes de iniciar sesión.',
    },
    legal: {
      lastUpdated: 'Última actualización: 21 de Enero de 2026',
      privacy: {
        title: 'Política de Privacidad',
        intro: 'TerraVest ("nosotros", "nuestro") respeta su privacidad y se compromete a proteger la información personal que comparte con nosotros.',
        sections: [
          { title: '1. Información que Recopilamos', content: ['Correo electrónico', 'Nombre y datos básicos', 'Información de registro', 'Datos técnicos (IP, navegador)'] },
          { title: '2. Cómo la Usamos', content: ['Proporcionar acceso a la plataforma', 'Comunicar actualizaciones', 'Responder consultas', 'Mejorar servicios', 'Cumplir requisitos legales'] },
          { title: '3. Seguridad de Datos', content: 'Implementamos salvaguardas administrativas y técnicas razonables para proteger su información.' },
          { title: '4. Sus Derechos', content: ['Acceder, corregir o eliminar datos', 'Retirar consentimiento', 'Solicitar información de procesamiento'] }
        ]
      },
      terms: {
        title: 'Términos de Servicio',
        intro: 'Al acceder o utilizar los servicios de TerraVest, acepta los siguientes Términos de Servicio.',
        sections: [
          { title: '1. Propósito de la Plataforma', content: 'TerraVest proporciona una plataforma tecnológica para contenido informativo sobre bienes raíces tokenizados. Nada aquí constituye asesoramiento legal o financiero.' },
          { title: '2. Elegibilidad', content: 'Usted es responsable de garantizar que su uso de TerraVest cumpla con las leyes de su jurisdicción.' },
          { title: '3. Sin Oferta de Inversión', content: 'TerraVest no ofrece valores ni actúa como corredor o asesor de inversiones en esta plataforma.' },
          { title: '4. Limitación de Responsabilidad', content: 'TerraVest no será responsable de daños indirectos o consecuentes derivados de su uso de la plataforma.' }
        ]
      },
      disclaimer: {
        title: 'Aviso Legal General',
        introBox: 'La información en TerraVest es solo para fines educativos e informativos.',
        introText: 'El contenido de este sitio no constituye asesoramiento de inversión, financiero, legal o fiscal.',
        bullets: [
          'Sin Asesoramiento: Busque consulta profesional.',
          'Advertencia de Riesgo: La tokenización implica alto riesgo.',
          'Sin Garantías: El rendimiento pasado no indica resultados futuros.'
        ],
        closing: 'Debe consultar a sus propios asesores legales y financieros antes de tomar decisiones.'
      }
    },
    contactPage: {
      title: 'Contáctenos',
      subtitle: '¿Preguntas sobre tokenización? Nuestro equipo está aquí para ayudar.',
      emailTitle: 'Soporte por Correo',
      emailDesc: 'Para consultas generales y soporte:',
      chatTitle: 'Chat en Vivo',
      chatDesc: 'Disponible días hábiles de 9h a 18h EST.',
      officeTitle: 'Oficina',
      officeDesc: '100 Biscayne Blvd, Miami, FL 33132',
      formTitle: 'Envíanos un mensaje',
      form: {
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        subject: 'Asunto',
        message: 'Mensaje',
        submit: 'Enviar Mensaje'
      }
    },
    propertyDetails: {
      notFound: 'Propiedad no encontrada.',
      backToMarketplace: 'Volver al Marketplace',
      backToMarket: 'Volver al Mercado',
      tokenizedAsset: 'Activo Tokenizado',
      estYield: 'Rend. Est.',
      investmentSummary: 'Resumen de Inversión',
      propertyHighlights: 'Destacados de la Propiedad',
      highlight1: 'Propiedad totalmente gestionada',
      highlight2: 'Pagos mensuales de renta',
      highlight3: 'Alto potencial de apreciacion',
      highlight4: 'Propiedad legal via LLC',
      investTitle: 'Invierte en este Activo',
      investSubtitle: 'Propiedad instantánea via tokens TerraVest',
      tokenPrice: 'Precio del Token',
      available: 'Disponible',
      amountTokens: 'Cantidad (Tokens)',
      tokensLabel: 'Tokens',
      total: 'Total:',
      loginToInvest: 'Debes iniciar sesión para invertir.',
      confirmInvestment: 'Confirmar Inversión',
      secureTransaction: 'Transacción segura via TerraVest',
      assetValue: 'Valor del Activo',
      totalTokens: 'Total de Tokens',
      orderCreated: 'Pedido creado! Ve al panel para completar el pago.',
      orderFailed: 'El pedido fallo.',
      loginToInvestButton: 'Inicia sesión para invertir',
      locationFallback: 'Estados Unidos',
      notAvailable: 'N/A',
    },
  },
  fr: {
    navbar: {
      marketplace: 'Marketplace',
      about: 'À propos',
      learn: 'Apprendre',
      login: 'Connexion',
      register: 'Commencer',
      account: 'Mon Compte',
      dashboard: 'Tableau de Bord',
      adminPanel: 'Panneau Admin',
      settings: 'Paramètres',
      balance: 'Solde',
      walletBalance: 'Solde du Portefeuille',
      deposit: 'Deposer',
      logout: 'Deconnexion',
      signedInAs: 'Connecte en tant que',
      refreshBalance: 'Rafraichir le Solde',
    },
    common: {
      status: {
        pending: 'En attente',
        processing: 'En traitement',
        approved: 'Approuvé',
        completed: 'Terminé',
        success: 'Succès',
        rejected: 'Rejeté',
        failed: 'Échec',
        canceled: 'Annulé',
        draft: 'Brouillon',
        active: 'Actif',
        deleted: 'Supprimé',
        funding: 'En financement',
        sold_out: 'Épuisé',
      },
      transactionTypes: {
        deposit: 'Dépôt',
        withdrawal: 'Retrait',
        sell: 'Vente',
        rent_distribution: 'Distribution de Loyer',
        buy: 'Achat',
      },
      actions: {
        edit: 'Modifier',
        delete: 'Supprimer',
        pasteFromClipboard: 'Coller depuis le presse-papiers',
        moveUp: 'Monter',
        moveDown: 'Descendre',
        remove: 'Retirer',
        mainImage: 'Image Principale',
        setAsMain: 'Définir comme Principale',
      },
      placeholders: {
        title: 'Titre',
        description: 'Description',
        imageUrl: 'https ://...',
        priceExample: '100k',
        tokensExample: '10k',
        monthlyYieldExample: '500',
        propertyTitle: 'Titre du Bien',
        propertyDescription: 'Description du bien...',
        location: 'Ville, Pays',
        priceUsd: '100000',
        totalTokens: '10000',
        yieldExample: '6-20 % ou ~12 % ou 10,5 %',
        addressExample: 'ex. 8a2f...',
      },
      images: {
        viewAlt: '{title} - Vue {index}',
        thumbnailAlt: 'Vignette {index}',
        noImages: 'Aucune image disponible',
        previousImage: 'Image précédente',
        nextImage: 'Image suivante',
      },
    },
    home: {
      heroBadge: 'Tokenisation Immobilière',
      heroTitleLine1: 'Investissez dans',
      heroTitleHighlight: 'l\'Immobilier US',
      heroTitleLine2: 'à partir de $50',
      heroSubtitle:
        'Rejoignez le futur de l\'investissement. Possédez des parts de biens locatifs à haut rendement sur la blockchain. Recevez un loyer mensuel dans votre portefeuille.',
      heroCtaPrimary: 'Voir les Biens',
      heroCtaSecondary: 'Créer un Compte',
      heroBackgroundAlt: 'Fond avec skyline de la ville',
      // --- FR HOME DETAILS ---
      stats: {
        value: "Valeur de Propriété",
        investors: "Investisseurs",
        yield: "Rendement Moyen",
        onChain: "On-Chain"
      },
      features: {
        mainTitle: "Pourquoi TerraVest ?",
        mainSubtitle: "Nous avons supprimé les barrières à l'entrée. Pas de banques, pas de paperasse, pas de frais cachés. Juste la propriété pure.",
        rentTitle: "Visibilité Mensuelle du Loyer",
        rentDesc: "Les revenus locatifs s'accumulent quotidiennement en fonction de vos jetons et deviennent visibles sur votre tableau de bord au début de chaque mois.",
        legalTitle: "Structure Juridique Américaine",
        legalDesc: "Chaque propriété est détenue par une LLC américaine dédiée. Les jetons représentent des droits de propriété indirects, protégés par la loi américaine sur la propriété.",
        liquidityTitle: "Liquidité du Marché Secondaire",
        liquidityDesc: "Les jetons peuvent être vendus sur les marchés secondaires pris en charge, vous offrant une flexibilité sans attendre des mois pour une vente immobilière."
      },
      finalCta: {
        title: "Prêt à construire votre portefeuille ?",
        subtitle: "Commencez à gagner des revenus locatifs quotidiens avec une clarté mensuelle.",
        button: "Commencez à Investir Maintenant"
      }
    },
    landing: {
      heroImageAlt: 'Skyline immobilier de Miami',
      tokenizationImageAlt: 'Graphique de tokenisation',
    },
    marketplace: {
      heroBadge: 'Opportunités Actives',
      title: 'Biens Américains Sélectionnés',
      subtitle: 'Investissez dans l\'immobilier premium à partir de $50.',
      searchPlaceholder: 'Rechercher des biens...',
      errorFallback: 'Échec du chargement des biens',
      emptyState: 'Aucun bien trouvé.',
    },
    about: {
      heroTitle: 'À propos de TerraVest',
      heroSubtitle:
        'TerraVest construit une façon plus simple et globale d\'investir dans l\'immobilier de rendement via la tokenisation.',
      heroCtaMarketplace: 'Explorer le Marketplace',
      heroCtaRegister: 'Créer un Compte',
      introTitle: 'Introduction à l\'Immobilier Tokenisé',
      introP1:
        'La façon d\'investir a évolué - de la propriété physique aux certificats papier puis aux systèmes numériques. La tokenisation est la prochaine étape. En convertissant les droits de propriété en tokens blockchain, les actifs réels peuvent être accédés et transférés avec plus d\'efficience.',
      introP2:
        'Chez TerraVest, nous appliquons la tokenisation à l\'immobilier locatif américain. Cela rend la propriété plus accessible et transparente.',
      introCta: 'Voir les Biens Tokenisés',
      tokenizationTitle: 'Qu\'est-ce que la Tokenisation d\'Actifs ?',
      tokenizationP1:
        'La tokenisation est le processus de conversion des droits d\'un actif réel en token blockchain. Chaque token représente une part de propriété et des droits économiques.',
      tokenizationP2:
        'Dans le modèle TerraVest, les biens sont détenus par des LLC américaines. Les investisseurs détiennent des tokens qui représentent une propriété indirecte.',
      benefitsTitle: 'Pourquoi la Tokenisation Compte',
      benefits: [
        {
          title: 'Transparence',
          desc: 'Les registres de propriété et transferts sont immuables, renforçant la confiance.',
        },
        {
          title: 'Liquidité',
          desc: 'Les tokens fractionnés rendent les actifs illiquides plus faciles à échanger.',
        },
        {
          title: 'Accès Global',
          desc: 'Les investisseurs du monde entier peuvent accéder à l\'immobilier US.',
        },
        {
          title: 'Barrière Plus Basse',
          desc: 'Des minimums plus faibles permettent de construire un portefeuille graduellement.',
        },
      ],
      midCta: 'Explorer le Marketplace',
      reTitle: 'Immobilier, Réimaginé',
      reP1:
        'Imaginez un bien de $100,000 divisé en 100 tokens. Chaque token représente 1% du bien. Les investisseurs peuvent construire leur position progressivement.',
      reP2:
        'Cette structure permet de diversifier et d\'accéder au revenu locatif avec flexibilité.',
      finalCtaText:
        'Commencez à investir dans l\'immobilier tokenisé avec revenus quotidiens.',
      finalCtaPrimary: 'Créer un Compte',
      finalCtaSecondary: 'Explorer le Marketplace',
      legalDisclosure:
        'TerraVest donne accès à des investissements immobiliers tokenisés via des LLC américaines. Les investissements comportent des risques, y compris la perte de capital, la vacance et les fluctuations de marché. Le revenu locatif n\'est pas garanti.',
    },
    learn: {
      heroTitle: 'Apprenez Comment TerraVest Fonctionne',
      heroSubtitle:
        'Gagnez un revenu locatif quotidien - avec visibilité mensuelle sur votre tableau de bord.',
      heroCtaMarketplace: 'Marketplace',
      heroCtaRegister: 'Créer un Compte',
      whatIsTitle: 'Qu\'est-ce que TerraVest ?',
      whatIsLink: 'À propos de TerraVest',
      whatIsItems: [
        {
          title: 'Qu\'est-ce que TerraVest ?',
          desc: 'TerraVest est une plateforme qui tokenise des biens locatifs aux États-Unis. Chaque bien est détenu par une LLC et divisé en tokens.',
        },
        {
          title: 'Pour les Investisseurs Globaux',
          desc: 'Conçu pour les investisseurs internationaux sans résidence ni banque locale.',
        },
        {
          title: 'Minimums Faibles',
          desc: 'La fractionalisation baisse la barrière d\'entrée.',
        },
      ],
      whoCanInvestTitle: 'Qui Peut Investir ?',
      whoCanInvestLink: 'S\'inscrire',
      whoCanInvestItems: [
        'Ouvert aux investisseurs de la plupart des pays.',
        'Aucun visa US, résidence ou compte bancaire américain requis.',
        'Des restrictions s\'appliquent aux juridictions à risque.',
        'Idéal pour les investisseurs non US cherchant un revenu en dollars.',
      ],
      processTitle: 'Comment Investir',
      processSubtitle:
        'Les tokens génèrent un loyer quotidien. Les gains sont affichés au début de chaque mois.',
      processSteps: [
        {
          title: '1. Explorer le Marketplace',
          desc: 'Parcourez des biens locatifs américains avec rendement attendu et structure légale.',
        },
        {
          title: '2. Acheter des Tokens',
          desc: 'Vous achetez des tokens représentant une propriété fractionnée.',
        },
        {
          title: '3. Accrual Quotidien',
          desc: 'Le loyer s\'accumule chaque jour selon vos tokens.',
        },
        {
          title: '4. Versement Mensuel',
          desc: 'Au début du mois, le loyer cumulé apparaît sur votre tableau de bord.',
        },
      ],
      processCta: 'Voir le Marketplace',
      walletTitle: 'Portefeuille, Sécurité et Flux de Revenu',
      walletItems: [
        {
          title: 'Portefeuille Investisseur',
          desc: 'Conservez tokens et revenus au même endroit.',
        },
        {
          title: 'Utilisation Flexible',
          desc: 'Retirez ou réinvestissez quand le loyer apparaît.',
        },
        {
          title: 'Sécurité et Contrôle',
          desc: 'Architecture non-custodial et authentification forte.',
        },
      ],
      feesTitle: 'Frais et Transparence',
      fees: [
        {
          title: 'Frais de Trading',
          rate: '1.5%',
          desc: 'Appliqués lors de l\'achat ou la vente de tokens.',
        },
        {
          title: 'Gestion Immobilière',
          rate: '10%',
          desc: 'Deduits du loyer avant distribution.',
        },
        {
          title: 'Frais de Retrait',
          rate: '$5 + 1%',
          desc: 'Appliqués lors du transfert vers un portefeuille externe.',
        },
      ],
      glossaryTitle: 'Glossaire',
      glossary: [
        {
          term: 'Immobilier Tokenisé',
          def: 'Structure où la propriété est représentée par des tokens blockchain.',
        },
        {
          term: 'Accrual Quotidien',
          def: 'Le revenu locatif est calcule et accumulé chaque jour.',
        },
        {
          term: 'LLC US',
          def: 'Entite légale qui détient le bien et limite la responsabilite.',
        },
      ],
      legalTitle: 'Avertissement Légal et Risques',
      legalDesc:
        'TerraVest donne accès à des investissements immobiliers tokenisés. Investir comporte des risques, y compris fluctuations, vacance et changements réglementaires. Le revenu n\'est pas garanti.',
      finalCtaText: 'Commencez à gagner un revenu quotidien avec visibilité mensuelle.',
      finalCtaMarketplace: 'Marketplace',
      finalCtaRegister: 'Créer un Compte',
    },
    dashboard: {
      redirecting: 'Chargement...',
      title: 'Mon Portefeuille',
      welcomeBack: 'Bon retour',
      totalNetWorth: 'Valeur Totale',
      withdraw: 'Retirer',
      cashBalance: 'Solde de Tresorerie',
      assetValue: 'Valeur des Actifs',
      unclaimedRent: 'Loyer Non Reclame',
      rewards: 'Recompenses',
      rewardsSubtitle: 'Accumulé à partir des loyers',
      claimToWallet: 'Reclamer au Portefeuille',
      assetsTitle: 'Vos Actifs',
      assetsEmpty: 'Aucun actif. Commencez dans le Marketplace.',
      active: 'Actif',
      tokensOwned: 'Tokens Detenus',
      currentValue: 'Valeur Actuelle',
      sellTokens: 'Vendre des Tokens',
      sellModalTitle: 'Vendre des Tokens',
      availableTokens: 'Tokens Disponibles :',
      pricePerToken: 'Prix par Token :',
      amountToSell: 'Montant a Vendre',
      sellAmountPlaceholder: '0',
      proceedsNote:
        'Les fonds (moins 1.5%) seront ajoutes a votre solde USD immediatement.',
      confirmSale: 'Confirmer la Vente',
      claimModalTitle: 'Reclamer les Recompenses',
      claimModalSubtitle: 'Deplacer le loyer cumulé vers votre portefeuille.',
      totalAmount: 'Montant Total',
      confirmAddToBalance: 'Confirmer et Ajouter au Solde',
      withdrawModalTitle: 'Retirer des Fonds',
      withdrawModalSubtitle: 'Transferer le solde USD vers votre portefeuille Bitcoin.',
      availableCash: 'Solde Disponible :',
      amountToWithdrawLabel: 'Montant a Retirer (USD)',
      amountToWithdrawPlaceholder: 'Min $50',
      insufficientFunds: 'Fonds insuffisants',
      withdrawalAmountLabel: 'Montant du Retrait :',
      processingFeeLabel: 'Frais de Traitement ($5 + 1%) :',
      youWillReceive: 'Vous recevrez :',
      destinationBtcAddress: 'Adresse BTC de Destination',
      btcPlaceholder: 'bc1q...',
      requestWithdrawal: 'Demander un Retrait',
      toastSellSuccess: 'Actif vendu ! Fonds ajoutes au solde USD.',
      toastClaimSuccess: 'Reclame ${amount} sur votre solde !',
      toastMinWithdrawal: 'Retrait minimum de $50',
      toastInsufficientCash: 'Solde insuffisant',
      toastInvalidBtc: 'Adresse BTC invalide',
      toastWithdrawRequest: 'Demande de retrait envoyee ! En attente de validation.',
    },
    footer: {
      disclaimerText: 'Ce site web est fourni à titre informatif uniquement et ne constitue pas une offre de vente ou une sollicitation d\'achat de titres ou de produits d\'investissement. Les performances passées ne préjugent pas des résultats futurs.',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      disclaimer: 'Avis Légal',
      contact: 'Contact',
    },
    transactionHistory: {
      title: 'Historique des Transactions',
      refreshTitle: 'Rafraîchir',
      columnType: 'Type',
      columnDate: 'Date',
      columnAmount: 'Montant',
      columnInfo: 'Info',
      columnStatus: 'Statut',
      columnExplorer: 'Explorateur',
      loading: 'Chargement des transactions...',
      errorTitle: 'Impossible de charger les transactions.',
      errorFallback: 'Erreur réseau',
      empty: 'Aucune transaction trouvée.',
      viewTx: 'Voir TX',
      viewAddress: 'Adresse',
    },
    depositModal: {
      title: 'Déposer des Fonds',
      subtitle: 'Ajoutez des USD à votre portefeuille via Bitcoin.',
      amountLabel: 'Montant à Déposer (USD)',
      amountPlaceholder: '100',
      estPaymentLabel: 'Paiement Est. :',
      minDepositNote:
        'Le dépôt minimum est {min}. Votre solde sera mis à jour automatiquement après 1 confirmation réseau.',
      submitLoading: "Génération de l'adresse...",
      submitContinue: 'Continuer',
      toastMinimumDeposit: 'Le dépôt minimum est {min}',
      toastAddressGenerated: 'Adresse de dépôt générée !',
      toastSessionError:
        'Impossible de lire la session. Rafraîchissez la page et reconnectez-vous.',
      toastCreateOrderFailed:
        "Impossible de créer la commande. Le backend est-il en cours d'exécution ?",
    },
    settings: {
      title: 'Paramètres du Compte',
      subtitle: 'Gerez votre sécurité, preferences et statut.',
      verifiedInvestor: 'Investisseur Verifie',
      accountLimits: 'Limites du Compte',
      depositLimit: 'Limite de Depot',
      depositLimitValue: '$50,000 / mois',
      withdrawalLimit: 'Limite de Retrait',
      withdrawalLimitValue: '$100,000 / mois',
      requestHigherLimits: 'Demander des Limites Plus Elevees',
      notificationsTitle: 'Notifications',
      notificationsSubtitle: 'Gerez notre communication.',
      emailAlerts: 'Alertes Email',
      emailAlertsDesc: 'Recevoir des emails transactionnels',
      securityAlerts: 'Alertes de Sécurité',
      securityAlertsDesc: 'Tentatives de connexion et changements de mot de passe',
      securityTitle: 'Sécurité',
      securitySubtitle: 'Mettre a jour votre mot de passe.',
      passwordPlaceholder: '********',
      newPassword: 'Nouveau Mot de Passe',
      confirmNewPassword: 'Confirmer le Mot de Passe',
      updatePassword: 'Mettre a Jour',
      withdrawalAddressTitle: 'Adresse de Retrait',
      withdrawalAddressSubtitle: 'Enregistrez votre adresse BTC par defaut.',
      withdrawalAddressPlaceholder: 'Entrez l adresse BTC (bc1q...)',
      edit: 'Modifier',
      dangerZoneTitle: 'Zone de Danger',
      dangerZoneText:
        'Une fois votre compte supprime, il est impossible de revenir en arriere.',
      deleteAccount: 'Supprimer le Compte',
      toastPasswordTooShort: 'Le mot de passe doit avoir au moins 8 caracteres.',
      toastPasswordMismatch: 'Les mots de passe ne correspondent pas.',
      toastPasswordUpdated: 'Mot de passe mis a jour !',
      toastPasswordUpdateFailed: 'Échec de mise a jour du mot de passe',
      toastPreferenceUpdated: 'Preference mise a jour',
      toastInvalidAddress: 'Adresse invalide',
      toastAddressSaved: 'Adresse de retrait enregistree !',
    },
    auth: {
      loginTitle: 'TerraVest',
      loginTitlePrefix: 'Terra',
      loginTitleBrand: 'Vest',
      loginSubtitle: 'Connectez-vous pour accéder à votre portefeuille',
      loginIdentifierPlaceholder: 'Email ou Utilisateur',
      loginPasswordPlaceholder: 'Mot de Passe',
      rememberMe: 'Se souvenir',
      forgotPassword: 'Mot de passe oublie',
      loginButton: 'Connexion',
      loginButtonLoading: 'Chargement...',
      loginNoAccount: "Vous n'avez pas de compte ?",
      loginRegisterLink: 'S inscrire',
      loginBotError: 'Confirmez que vous n etes pas un robot',
      loginWelcome: 'Bon retour!',
      loginFailed: 'Connexion echouee',
      loginSecurityError: 'Échec du chargement de la verification.',
      registerTitlePrefix: 'Rejoignez',
      registerTitleBrand: 'TerraVest',
      registerSubtitle: 'Créez votre compte pour commencer a investir',
      registerBullet1: 'Gagnez un loyer quotidien, visible mensuellement',
      registerBullet2: 'Biens détenus via LLC aux USA',
      registerBullet3: 'A partir de $50 - sans banques, sans paperasse',
      registerUsernamePlaceholder: 'Utilisateur',
      registerUsernameHint:
        'Nom public. Doit être unique - modifiable plus tard.',
      registerEmailPlaceholder: 'Adresse Email',
      registerPasswordPlaceholder: 'Mot de Passe',
      registerConfirmPasswordPlaceholder: 'Confirmer le Mot de Passe',
      registerPasswordRequirementsTitle: 'Exigences de Mot de Passe:',
      registerRequirementLength: 'Au moins 8 caracteres',
      registerRequirementUpper: 'Au moins une majuscule (A-Z)',
      registerRequirementLower: 'Au moins une minuscule (a-z)',
      registerRequirementNumber: 'Au moins un numero (0-9)',
      registerRequirementSpecial: 'Au moins un caractere special (!@#$)',
      registerButton: 'Créer un Compte',
      registerButtonLoading: 'Creation du compte...',
      registerTerms:
        'En creant un compte, vous reconnaissez que ces investissements comportent un risque.',
      registerTermsLink: 'En savoir plus',
      registerTrustedBy: 'Deja choisi par des investisseurs de 40+ pays',
      registerHaveAccount: 'Vous avez déjà un compte?',
      registerLoginLink: 'Connexion',
      toastRegisterMismatch: 'Les mots de passe ne correspondent pas.',
      toastRegisterRequirements: 'Veuillez respecter tous les criteres.',
      toastRegisterCreated: 'Compte créé avec succes!',
      toastRegisterSuccessLogin: 'Inscription réussie! Connectez-vous.',
      email_verification_required: 'Veuillez vérifier votre e-mail pour continuer',
      email_verification_sent: 'E-mail de vérification envoyé. Vérifiez votre boîte de réception.',
      email_verification_pending_body:
        'Nous avons envoyé un lien de vérification à votre e-mail. Cliquez sur le lien pour activer votre compte.',
      email_verification_resend: 'Renvoyer l’e-mail de vérification',
      email_verification_resend_loading: 'Envoi de l’e-mail de vérification...',
      email_verification_resend_failed: 'Échec de l’envoi de l’e-mail de vérification.',
      email_verification_resend_missing: 'Saisissez votre e-mail pour renvoyer la vérification.',
      email_verification_title: 'Vérification de l’e-mail',
      email_verification_loading: 'Vérification de votre e-mail...',
      email_verification_success: 'E-mail vérifié avec succès.',
      email_verification_expired: 'Le lien de vérification est invalide ou expiré.',
      email_verification_login: 'Aller à la connexion',
      email_not_verified_error: 'Veuillez vérifier votre e-mail avant de vous connecter.',
    },
    legal: {
      lastUpdated: 'Dernière mise à jour : 21 Janvier 2026',
      privacy: {
        title: 'Politique de Confidentialité',
        intro: 'TerraVest (« nous », « notre ») respecte votre vie privée et s\'engage à protéger les données personnelles que vous partagez avec nous.',
        sections: [
          { title: '1. Informations Collectées', content: ['Adresse e-mail', 'Nom et coordonnées', 'Informations de compte', 'Données techniques (IP, navigateur)'] },
          { title: '2. Utilisation', content: ['Fournir l\'accès à la plateforme', 'Communiquer les mises à jour', 'Répondre aux demandes', 'Améliorer les services', 'Conformité légale'] },
          { title: '3. Sécurité des Données', content: 'Nous mettons en œuvre des mesures de sécurité administratives et techniques raisonnables.' },
          { title: '4. Vos Droits', content: ['Accéder, corriger ou supprimer des données', 'Retirer le consentement', 'Demander des infos sur le traitement'] }
        ]
      },
      terms: {
        title: 'Conditions d\'Utilisation',
        intro: 'En accédant ou en utilisant les services TerraVest, vous acceptez les conditions suivantes.',
        sections: [
          { title: '1. But de la Plateforme', content: 'TerraVest fournit une plateforme technologique pour présenter du contenu sur l\'immobilier tokenisé. Rien ici ne constitue un conseil juridique ou financier.' },
          { title: '2. Éligibilité', content: 'Vous êtes responsable de vous assurer que votre utilisation est conforme aux lois de votre juridiction.' },
          { title: '3. Aucune Offre d\'Investissement', content: 'TerraVest n\'offre pas de titres et n\'agit pas comme courtier ou conseiller en investissement sur cette plateforme.' },
          { title: '4. Limitation de Responsabilité', content: 'TerraVest ne sera pas responsable des dommages indirects ou consécutifs découlant de votre utilisation.' }
        ]
      },
      disclaimer: {
        title: 'Avis Légal Général',
        introBox: 'Les informations fournies sur TerraVest sont uniquement à des fins éducatives et informatives.',
        introText: 'Le contenu de ce site ne constitue pas un conseil en investissement, financier, juridique ou fiscal.',
        bullets: [
          'Pas de Conseil : Consultez un professionnel.',
          'Risque : La tokenisation implique un risque élevé.',
          'Pas de Garanties : Les performances passées ne préjugent pas des résultats futurs.'
        ],
        closing: 'Vous devez consulter vos propres conseillers juridiques et financiers avant de prendre des décisions.'
      }
    },
    contactPage: {
      title: 'Contactez-nous',
      subtitle: 'Des questions sur la tokenisation ? Notre équipe est là pour vous aider.',
      emailTitle: 'Support Email',
      emailDesc: 'Pour les demandes générales :',
      chatTitle: 'Chat en Direct',
      chatDesc: 'Disponible en semaine de 9h à 18h EST.',
      officeTitle: 'Bureau',
      officeDesc: '100 Biscayne Blvd, Miami, FL 33132',
      formTitle: 'Envoyez-nous un message',
      form: {
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Adresse E-mail',
        subject: 'Sujet',
        message: 'Message',
        submit: 'Envoyer le Message'
      }
    },
    propertyDetails: {
      notFound: 'Bien introuvable.',
      backToMarketplace: 'Retour au Marketplace',
      backToMarket: 'Retour au Marche',
      tokenizedAsset: 'Actif Tokenisé',
      estYield: 'Rendement Est.',
      investmentSummary: 'Resume d Investissement',
      propertyHighlights: 'Points Forts',
      highlight1: 'Bien gere completement',
      highlight2: 'Paiements de loyer mensuels',
      highlight3: 'Fort potentiel d appreciation',
      highlight4: 'Propriete légale via LLC',
      investTitle: 'Investir dans cet Actif',
      investSubtitle: 'Propriete instantanee via tokens TerraVest',
      tokenPrice: 'Prix du Token',
      available: 'Disponible',
      amountTokens: 'Montant (Tokens)',
      tokensLabel: 'Tokens',
      total: 'Total:',
      loginToInvest: 'Vous devez être connecte pour investir.',
      confirmInvestment: 'Confirmer l Investissement',
      secureTransaction: 'Transaction sécurisée via TerraVest',
      assetValue: 'Valeur de l Actif',
      totalTokens: 'Total des Tokens',
      orderCreated: 'Commande créée! Allez au tableau de bord pour payer.',
      orderFailed: 'Échec de la commande.',
      loginToInvestButton: 'Connexion pour investir',
      locationFallback: 'États-Unis',
      notAvailable: 'N/A',
    },
  },
};