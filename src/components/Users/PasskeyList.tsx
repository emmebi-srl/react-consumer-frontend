import { CloudDoneOutlined, Key } from '@mui/icons-material';
import { Chip, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { UserPasskey } from '~/types/aries-proxy/users';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';

interface Props {
  passkeys: UserPasskey[];
  emptyText: string;
  /** Buttons of a row (rename, delete). */
  renderActions?: (passkey: UserPasskey) => ReactNode;
}

/** Passkeys of a user, shared by the profile and the users management. */
const PasskeyList: React.FC<Props> = ({ passkeys, emptyText, renderActions }) => {
  if (passkeys.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {passkeys.map((passkey) => (
        <ListItem key={passkey.id} divider disableGutters secondaryAction={renderActions?.(passkey)}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Key color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                {passkey.name}
                {passkey.isBackedUp ? (
                  <Chip
                    icon={<CloudDoneOutlined />}
                    label="Sincronizzata"
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                ) : null}
              </>
            }
            secondary={`Creata il ${getStringDateTimeByUnixtimestamp(passkey.createdAt)} · ${
              passkey.lastUsedAt
                ? `ultimo accesso ${getStringDateTimeByUnixtimestamp(passkey.lastUsedAt)}`
                : 'mai usata'
            }`}
            sx={{ pr: renderActions ? 10 : 0 }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default PasskeyList;
