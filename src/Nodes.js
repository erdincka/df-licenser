import { useState } from 'react';
import { Box, Button, DataTable, Select, Text, TextInput } from 'grommet';
import { Clone, Duplicate, Trash } from 'grommet-icons';

function Nodes() {
  const defaultNode = {'role': '', 'core': 32, 'mem': 256, 'disk': 50, 'quantity': 1 };
  const [nodes, setNodes] = useState([defaultNode]);

  const setNodeRole = (node, role) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes[nodes.indexOf(node)].role = role;
    setNodes(newNodes);
  }
  const setNodeCore = (node, core) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes[nodes.indexOf(node)].core = parseInt(core) || 32;
    setNodes(newNodes);
  }
  const setNodeMem = (node, mem) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes[nodes.indexOf(node)].mem = parseInt(mem) || 256;
    setNodes(newNodes);
  }
  const setNodeDisk = (node, disk) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes[nodes.indexOf(node)].disk = parseInt(disk) || 50;
    setNodes(newNodes);
  }
  const setNodeQty = (node, q) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes[nodes.indexOf(node)].quantity = parseInt(q) || 1;
    setNodes(newNodes);
  }
  const cloneNode = (idx) => {
    setNodes([...nodes, JSON.parse(JSON.stringify(nodes[idx]))]);
  }
  const removeNode = (idx) => {
    let newNodes = JSON.parse(JSON.stringify(nodes));
    newNodes.splice(idx, 1);
    setNodes(newNodes);
  }

  return (
    <Box gap='small' fill>
      <Box direction='row' justify='between'>
        <Button
          icon={<Duplicate />} 
          label='Add node' reverse
          pad='small'
          onClick={() => setNodes([...nodes, defaultNode]) } 
        />
      </Box>
      <DataTable
        border="bottom"
        columns={[
          {
            property: 'ops',
            header: <Text>Clone / Remove</Text>,
            render: node => (
              <Box direction='row'>
                <Clone color='status-ok' id={nodes.indexOf(node)} onClick={ (event) => cloneNode(event.target.id) } />
                /
                <Trash color='status-critical' id={nodes.indexOf(node)} onClick={ (event) => removeNode(event.target.id) } />
              </Box>
            )
          },
          {
            property: 'role',
            header: <Text>Role</Text>,
            primary: true,
            render: node => (
              <Box pad={{ vertical: 'none' }} >
                <Select
                  options={['admin', 'compute', 'storage', 'edge']} 
                  value={node.role}
                  onChange={({ option }) => setNodeRole(node, option)}
                />
            </Box>
            )
          },
          {
            property: 'core',
            header: <Text>Cores</Text>,
            primary: true,
            render: node => (
              <TextInput value={node.core} type='number' min={1} onChange={ (event) => setNodeCore(node, event.target.value) } />
            )
          },
          {
            property: 'mem',
            header: <Text>Mem(GB)</Text>,
            primary: true,
            render: node => (
              <TextInput value={node.mem} type='number' min={1} onChange={ (event) => setNodeMem(node, event.target.value) } />
            )
          },
          {
            property: 'disk',
            header: <Text>Capacity(TB)</Text>,
            primary: true,
            render: node => (
              <TextInput value={node.disk} type='number' min={1} onChange={ (event) => setNodeDisk(node, event.target.value) } />
            )
          },
          {
            property: 'Qty',
            header: <Text>Qty</Text>,
            render: node => (
              <TextInput value={node.quantity} type='number' min={1} onChange={ (event) => setNodeQty(node, event.target.value) } />
            )
          },
          {
            property: 'CUs',
            header: <Text>License (CU)</Text>,
            render: node => (
              <Box direction='row'>
                <Text>
                  {
                    node.quantity * Math.max(
                      Math.ceil(parseInt(node.core) / 32),
                      Math.ceil(parseInt(node.mem) / 256),
                      Math.ceil(parseInt(node.disk) / 50)
                    )
                  }
                </Text>
              </Box>
            )
          }
        ]}
        data={nodes}
      />

      <Text alignSelf='end' size='large' weight='bold'>
        Total Licenses:
        {
          nodes.map( node => 
            node.quantity * Math.max(
              Math.ceil(parseInt(node.core) / 32),
              Math.ceil(parseInt(node.mem) / 256),
              Math.ceil(parseInt(node.disk) / 50)
            )
          ).reduce( (a,b) => a + b, 0)
        }
      </Text>

    </Box>
  );
}
export default Nodes;
