import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import React from 'react';

export interface LandingServiceCardItem {
  description: string;
  icon: React.ReactNode;
  title: string;
  value: string;
}

interface LandingServiceCardsProps {
  items: LandingServiceCardItem[];
}

const ServiceCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  height: '100%',
}));

const LandingServiceCards: React.FC<LandingServiceCardsProps> = ({ items }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <ServiceCard key={item.title} variant="outlined">
          <CardContent sx={{ p: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 18,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {item.title}
                </Typography>
              </Box>

              <Box sx={{ px: 2.5, py: 2.5 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.75, fontSize: { xs: 22, md: 24 } }}>
                  {item.value}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </ServiceCard>
      ))}
    </Box>
  );
};

export default LandingServiceCards;
