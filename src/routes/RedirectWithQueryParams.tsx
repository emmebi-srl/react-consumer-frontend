import { Navigate, useSearchParams } from 'react-router-dom';
import _isEmpty from 'lodash/isEmpty';

interface Props {
  path: string;
}

const RedirectWithQueryParams: React.FC<Props> = ({ path }) => {
  const [params] = useSearchParams();
  const queryString = params.toString();
  const to = !_isEmpty(queryString) ? `${path}?${queryString}` : path;
  return <Navigate to={to} replace />;
};

export default RedirectWithQueryParams;
