import { TableCell } from '@mui/material';
import DetailDataCell from '~/components/Table/DetailDataCell';
import { MainLabel, MonospaceMainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { UserAccount, UserRoleOption } from '~/types/aries-proxy/users';

interface Props {
  user: UserAccount;
  roles: UserRoleOption[];
}

const UserListRowContent: React.FC<Props> = ({ user, roles }) => {
  const roleNames = user.roleIds
    .map((roleId) => roles.find((role) => role.id === roleId)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <TableCell align="right">
        <MonospaceMainLabel>{user.id}</MonospaceMainLabel>
      </TableCell>
      <TableCell>
        <DetailDataCell sx={{ overflow: 'hidden' }}>
          <MainLabel>{user.username}</MainLabel>
          {user.description ? <SecondaryLabel>{user.description}</SecondaryLabel> : null}
        </DetailDataCell>
      </TableCell>
      <TableCell>
        <MainLabel>{user.userType}</MainLabel>
      </TableCell>
      {/* Empty cells must stay empty: the phone cards hide them only without content. */}
      <TableCell>{roleNames ? <SecondaryLabel>{roleNames}</SecondaryLabel> : null}</TableCell>
      <TableCell>{user.email ? <SecondaryLabel>{user.email}</SecondaryLabel> : null}</TableCell>
      <TableCell align="right">
        {user.passkeyCount > 0 ? <MonospaceMainLabel>{user.passkeyCount}</MonospaceMainLabel> : null}
      </TableCell>
    </>
  );
};

export default UserListRowContent;
