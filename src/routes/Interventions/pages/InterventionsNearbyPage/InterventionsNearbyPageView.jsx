import React from 'react'
import Nearby from '../../../../components/Interventions/Nearby';

class InterventionsNearbyPageView extends React.PureComponent {
  render () {
    return (
      <Nearby isLoading={false}></Nearby>
    );
  }
}

InterventionsNearbyPageView.propTypes = { 
}

export default InterventionsNearbyPageView