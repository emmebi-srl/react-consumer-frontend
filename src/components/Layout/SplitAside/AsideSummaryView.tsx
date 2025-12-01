import { Icon, SvgIconTypeMap, Typography, styled } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { PropsWithChildren } from 'react';

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: theme.palette.secondary.main,
  paddingTop: theme.spacing(2),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(4),
}));

const MainDetailsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const Details = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

interface Props {
  icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  title: string;
  subtitle: string;
}

export const AsideSummaryView = ({ icon: IconComponent, title, subtitle, children }: PropsWithChildren<Props>) => {
  return (
    <Container>
      <MainDetailsContainer>
        {IconComponent && <Icon component={IconComponent} />}
        <Details>
          <Typography variant="h5" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {subtitle}
          </Typography>
        </Details>
      </MainDetailsContainer>
      {children}
    </Container>
  );
};
