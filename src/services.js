const services = [
  {
    'id': 'moss',
    'name': 'S3 Object Store',
    'options': [
      'capacity'
    ],
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'nfs',
    'name': 'NFS v3/v4',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'smb',
    'name': 'SMB ',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'hbase',
    'name': 'HBase',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'documentdb',
    'name': 'Document DB',
    'options': [
      'capacity'
    ],
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'events',
    'name': 'Event Store',
    'options': [
      'avgMsgSize',
      'peakMsgPerSec'
    ],
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'drill',
    'name': 'Drill',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'airflow',
    'name': 'Airflow',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'hive',
    'name': 'Hive',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'livy',
    'name': 'Livy',
    'cores': 2,
    'memory': 4,
    'ssd': true
  },
  {
    'id': 'spark',
    'name': 'Spark',
    'options': [
      'coresForApps'
    ],
    'cores': 2,
    'memory': 4
  },
  {
    'id': 'monitoring',
    'name': 'Monitoring',
    'cores': 2,
    'memory': 4,
    'ssd': false
  },
];

export default services;