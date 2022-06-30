const services = [
  {
    'id': 'moss',
    'name': 'S3 Object Store',
    'cores': 2,
    'memory': 4,
    'ssd': false
  },
  {
    'id': 'smb',
    'name': 'SMB',
    'cores': 2,
    'memory': 4,
    'ssd': false
  },
  {
    'id': 'dbevents',
    'name': 'DB and Event Store',
    'cores': 8,
    'memory': 192,
    'ssd': true
  },
];

export default services;