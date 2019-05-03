import PropTypes from 'prop-types'

export const dataShape = PropTypes.shape({
    serialNumber: PropTypes.string,
    internalIp: PropTypes.string,
    externalIp: PropTypes.string,
    ports: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    peerToPeer: PropTypes.bool,
    peerToPeerNotes: PropTypes.string,
    snmpVersion: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    ping: PropTypes.string,
    ddnsServer: PropTypes.string,
    ddnsUsername: PropTypes.string,
    ddnsPassword: PropTypes.string,
    notes: PropTypes.string,
});

export const optionsShape = PropTypes.shape({
    readonly: PropTypes.bool,
});