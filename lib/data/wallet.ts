export const WALLET_TOKENS = [
  {
    id: 'eth',
    iconUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBcG7KEIDojVhI04QsZ7dlnODliu67wJJtQ6AQL5p-QO2biNGCDEne56FzuJHNqsWp1Q6mo4O6XJKTaaBp4vSUSHjVqNe8057nH2GiCj1K73JselVeagqJn3RMRm3DhauCj6QMRFajdkk5ViDiNlGZbswppWhpvfW0avcBIpWxgAWnxijdCK7slyXvQXCTZvd4y9ijdHkdim0_4akNWWhxTaCfuub_eU41_U2ds6eqQAusyI0noBa18iOW0bTar8RrIlyvYTunSsxw',
    name: 'Ethereum',
    symbol: 'ETH',
    amount: '4.82',
    change: '+$245.12',
    changeType: 'positive' as const,
  },
  {
    id: 'sol',
    iconUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfjpvPpV36f4rosaaJPli_YHRCoFiu7ecijblawG4xQ_5hfN6-J3b9iuAq52nJiWKFAccklXl2RqfM0wUffmxxPbWmWhZN_SbZL1xSMBVE0mtYdfs7zAqcNLVfN_ue8HO5-SUhY-39xafJUJQKzeuHXHxVeu3kzwH2YO3RNZUVqGAjs5jJk-2umrC3VGh6uCzdK2VeQ0SGRFyAQR62Qk4Wt0NHV0iIuBAqZYdvJtyH2qy6YvPJb6knLvzWt9KGOAbD-etD379BDk4',
    name: 'Solana',
    symbol: 'SOL',
    amount: '12.50',
    change: '-$12.04',
    changeType: 'negative' as const,
  },
  {
    id: 'usdt',
    iconUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7W5dYva1t6ZYasvySkCiHMRQKlrhiJ1A9R13z51Hn28LP4DNrOGtWMvaHmdUy3t7xoWkxBvBbKgeZFG4wD0NXjWTie1kn7MTEYJYAMVbSQFbsRZJm3LTjXSL_q9Bvdv7Pxde7C3R7CgOZuHvkuUuQw04guB-FQnX1qKYaarj23WqNUh9c1-oNtyhoqOlFT3kSy9nxYT9v0I6JDntduf1CqeTZ5m7CxJJN3tY332wtzz49Q4l3OLgYJpN9Lf5Yr2xVUf_a7H8itE',
    name: 'Tether',
    symbol: 'USDT',
    amount: '50.00',
    change: '$50.00',
    changeType: 'neutral' as const,
  },
] as const;
