import { useState } from 'react';
import { Box, Button, DataTable, Select, Text, TextInput } from 'grommet';
import { Clone, Duplicate, Trash } from 'grommet-icons';

function Volumes() {
  const defaultVolume = {'Capacity (TB)': '', 'replicas': 3, 'quantity': 1 };
  const [volumes, setVolumes] = useState([defaultVolume]);

  const setVolumeRole = (volume, role) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes[volumes.indexOf(volume)].role = role;
    setVolumes(newVolumes);
  }
  const setVolumeCore = (volume, core) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes[volumes.indexOf(volume)].core = parseInt(core) || 32;
    setVolumes(newVolumes);
  }
  const setVolumeMem = (volume, mem) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes[volumes.indexOf(volume)].mem = parseInt(mem) || 256;
    setVolumes(newVolumes);
  }
  const setVolumeDisk = (volume, disk) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes[volumes.indexOf(volume)].disk = parseInt(disk) || 50;
    setVolumes(newVolumes);
  }
  const setVolumeQty = (volume, q) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes[volumes.indexOf(volume)].quantity = parseInt(q) || 1;
    setVolumes(newVolumes);
  }
  const cloneVolume = (idx) => {
    setVolumes([...volumes, JSON.parse(JSON.stringify(volumes[idx]))]);
  }
  const removeVolume = (idx) => {
    let newVolumes = JSON.parse(JSON.stringify(volumes));
    newVolumes.splice(idx, 1);
    setVolumes(newVolumes);
  }

  return (
    <Box gap='small' fill>
      <Box direction='row' justify='between'>
        <Button
          icon={<Duplicate />} 
          label='Add volume' reverse
          pad='small'
          onClick={() => setVolumes([...volumes, defaultVolume]) } 
        />
      </Box>
      <DataTable
        border="bottom"
        columns={[
          {
            property: 'ops',
            header: <Text>Clone / Remove</Text>,
            render: volume => (
              <Box direction='row'>
                <Clone color='status-ok' id={volumes.indexOf(volume)} onClick={ (event) => cloneVolume(event.target.id) } />
                /
                <Trash color='status-critical' id={volumes.indexOf(volume)} onClick={ (event) => removeVolume(event.target.id) } />
              </Box>
            )
          },
          {
            property: 'role',
            header: <Text>Role</Text>,
            primary: true,
            render: volume => (
              <Box pad={{ vertical: 'none' }} >
                <Select
                  options={['admin', 'compute', 'storage', 'edge']} 
                  value={volume.role}
                  onChange={({ option }) => setVolumeRole(volume, option)}
                />
            </Box>
            )
          },
          {
            property: 'core',
            header: <Text>Cores</Text>,
            primary: true,
            render: volume => (
              <TextInput value={volume.core} type='number' min={1} onChange={ (event) => setVolumeCore(volume, event.target.value) } />
            )
          },
          {
            property: 'mem',
            header: <Text>Mem(GB)</Text>,
            primary: true,
            render: volume => (
              <TextInput value={volume.mem} type='number' min={1} onChange={ (event) => setVolumeMem(volume, event.target.value) } />
            )
          },
          {
            property: 'disk',
            header: <Text>Capacity(TB)</Text>,
            primary: true,
            render: volume => (
              <TextInput value={volume.disk} type='number' min={1} onChange={ (event) => setVolumeDisk(volume, event.target.value) } />
            )
          },
          {
            property: 'Qty',
            header: <Text>Qty</Text>,
            render: volume => (
              <TextInput value={volume.quantity} type='number' min={1} onChange={ (event) => setVolumeQty(volume, event.target.value) } />
            )
          },
          {
            property: 'CUs',
            header: <Text>License (CU)</Text>,
            render: volume => (
              <Box direction='row'>
                <Text>
                  {
                    volume.quantity * Math.max(
                      Math.ceil(parseInt(volume.core) / 32),
                      Math.ceil(parseInt(volume.mem) / 256),
                      Math.ceil(parseInt(volume.disk) / 50)
                    )
                  }
                </Text>
              </Box>
            )
          }
        ]}
        data={volumes}
      />

      <Text alignSelf='end' size='large' weight='bold'>
        Total Licenses:
        {
          volumes.map( volume => 
            volume.quantity * Math.max(
              Math.ceil(parseInt(volume.core) / 32),
              Math.ceil(parseInt(volume.mem) / 256),
              Math.ceil(parseInt(volume.disk) / 50)
            )
          ).reduce( (a,b) => a + b, 0)
        }
      </Text>

    </Box>
  );
}
export default Volumes;
