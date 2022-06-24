import React, { useState } from 'react';
import { Box, TextInput, FormField, CheckBox, Text, Form, Grid, Meter, DataTable, Stack, MaskedInput, NameValueList, NameValuePair, RangeInput } from 'grommet';
import services from './services';

function Nodes(mode) {

  const [inputs, setInputs] = useState({ capacity: 100, tiered: true, tierratio: 30, ec:"4:2" });
  const [active, setActive] = useState(0);
  const [label, setLabel] = useState('');
  const [highlight, setHighlight] = useState(false);

  // Fixed parameters below
  const licenses = [
    // { sku: 'R9J35AAE', desc: 'HPE Ezmeral Runtime Enterprise E-LTU' },
    // { sku: 'R9J37AAE', desc: 'HPE Ezmeral ML Ops E-LTU' },
    { sku: 'R9J44AAE', desc: 'HPE Ezmeral Data Fab File Object E-LTU' },
    { sku: 'R9J47AAE', desc: 'HPE Ezmeral Data Fab Anlyt Prem Pk E-LTU' },
  ]

  // Calculated parameters below
  let ec_scheme = inputs.ec?.split(':').map(n => Number(n))
  // TODO: consider other factors for node count - max node capacity, performance, recovery times...
  let selected_services = services.filter( s => s.id in inputs && inputs[s.id] );
  let node_count = Number((inputs.tiered ? ec_scheme.reduce((a, b) => a + b, 2) : 5));
  let node_cores = 16 + selected_services.map(s => s.cores).reduce( (a,b) => a + b, 0);
  let node_memory = 64 + selected_services.map(s => s.memory).reduce( (a,b) => a + b, 0);
  let need_ssd = selected_services.map(s => s.ssd).some(s => s);
  let capacity_hot = Math.ceil(Number(inputs.tiered ? inputs.capacity * (inputs.tierratio/100) : inputs.capacity));
  let capacity_warm = Math.ceil(Number(inputs.tiered ? inputs.capacity * (1-inputs.tierratio/100) : 0));
  // TODO: Adjust buffer for capacity
  let tier_overhead = ( ec_scheme.reduce(( a, b ) => a + b, 0 ) / (ec_scheme[0] || 1) );
  let rawcapacity_hot = Math.ceil(Number(capacity_hot * 4));
  let rawcapacity_warm = Math.ceil( capacity_warm * tier_overhead );
  let node_hdd = Math.ceil(rawcapacity_hot / node_count);
  let node_nl = Math.ceil(rawcapacity_warm / node_count);

  let licenses_needed = licenses.map(license => {
    switch(license.sku){
      case 'R9J44AAE':
        license.qty = rawcapacity_hot + rawcapacity_warm
        break;
      case 'R9J47AAE':
        license.qty = node_count * node_cores;
        break;
      default:
        license.qty = 0
    }
    return license
  });
  
  return (
    <Box margin='small'>
      <Box gap='small'>
        {/* Inputs */}
        <Form
        value={ inputs } validate="blur"
        onChange={ nextValue => setInputs(nextValue) }
        >
          <Text weight={'bold'}>Capacity</Text>
          <Box direction="row" gap="medium">
            <FormField name="capacity" htmlFor="capacity" label="Usable TB">
              <TextInput type='number' id='capacity' name='capacity' min={ 30 } step='10' />
            </FormField>
            { mode.expert && (<FormField name="adminnodes" htmlFor="adminnodes" label={ "Admin Nodes: " + (inputs.adminnodes ? inputs.adminnodecount || 0 : 0) } >
              <CheckBox id="adminnodes" name="adminnodes" toggle />
                { inputs.adminnodes && 
                <TextInput type='number' 
                    id='adminnodecount' 
                    name='adminnodecount' 
                    placeholder='Admin Node count' 
                    min={0}
                  />
                }
              </FormField>)
            }
            { mode.expert && (<FormField name="edgenodes" htmlFor="edgenodes" label={ "Edge Nodes: " + (inputs.edgenodes ? inputs.edgenodecount || 0 : 0) } >
              <CheckBox id="edgenodes" name="edgenodes" toggle />
                { inputs.edgenodes && 
                <TextInput type='number' 
                    id='edgenodecount' 
                    name='edgenodecount' 
                    placeholder='Edge Node count' 
                    min={0}
                  />
                }
              </FormField>)
            }
            <FormField name="tiered" htmlFor="tiered" label="Tiered">
              <CheckBox id="tiered" name="tiered" toggle defaultChecked />
            </FormField>
            { inputs.tiered && mode.expert && <FormField name="ec" htmlFor="ec" label="EC Scheme">
              <MaskedInput id="ec" name="ec"
                mask={[
                  {
                    length: [1, 2],
                    options: [3, 4, 5, 6, 10, 12, 14],
                    regexp: /^\d{1,2}$/,
                    placeholder: 'Data',
                  },
                  { fixed: ':' },
                  {
                    length: 1,
                    options: [2, 3, 4, 5, 6, 7, 8, 9],
                    regexp: /^\d{1,2}$/,
                    placeholder: 'Parity',
                  },
                ]}
              />
            </FormField>
            }
            {inputs.tiered && mode.expert && <Box align="center" width="small" direction='row'>
                <FormField name="tierratio" htmlFor="tierratio" label={ "Hot tier ratio: " + inputs.tierratio }>
                  <RangeInput id="tierratio" name='tierratio'
                    min={30}
                    max={100}
                    step={10}
                  />
                </FormField>
              </Box>
            }
          </Box>

          { mode.expert && <Text weight={'bold'}>Data Services</Text> }
          { mode.expert && 
          <Grid columns={ { count: 6, size: 'auto' }} gap="small">
            {
              services.map(service => 
                (
                  <Box key={service.id} >
                    <FormField name={service.id} htmlFor={service.id} label={service.name}>
                      <CheckBox id={service.id} name={service.id} toggle />
                    </FormField>
                    { inputs[service.id] && service.options?.map(o => 
                        <CheckBox key={ o} name={service.id + '_' + o } checked={service.options.o} label={o} />
                      )
                    }
                  </Box>
                )
              )
            }
          </Grid>
        }
        </Form>
        {/* Recommendations */}
        <Text weight='bold' color='brand'>Recommeded Sizing</Text>
        <Grid columns={ { count: 2, size: 'auto' }} gap="medium">
          {/* Capacity output */}
          <Box align="center" pad="small">
            <Text weight="bold" size="2xl" margin={{bottom: '12px'}}>
              Capacity
            </Text>
            <Stack anchor="center">
              <Meter
                type="circle"
                background="light-2"
                values={[
                  {
                    value: capacity_hot,
                    onHover: (over) => {
                      setActive(over ? rawcapacity_hot : 0);
                      setLabel(over ? 'hot data' : undefined);
                    },
                  },
                  {
                    value: capacity_warm,
                    onHover: (over) => {
                      setActive(over ? rawcapacity_warm : 0);
                      setLabel(over ? 'warm data' : undefined);
                    },
                    onClick: () => {
                      setHighlight(() => !highlight);
                    },
                    highlight,
                  },
                ]}
                // max={inputs.capacity}
                size="small"
                thickness="medium"
              />
              <Box align="center">
                <Box direction="row" align="center" pad={{ bottom: 'xsmall' }}>
                  <Text size="xxlarge" weight="bold">
                    {active || (rawcapacity_hot + rawcapacity_warm) }
                  </Text>
                  <Text>TB</Text>
                </Box>
                <Text>{label || 'raw'}</Text>
              </Box>
            </Stack>
            <Text weight='normal'> { inputs.tiered ? "SSD/HDD vs NL" : "SSD/HDD" }</Text>
          </Box>
          {/* Performance output */}
          <Box align="center" pad="small">
            <Text weight="bold" size="2xl" margin={{bottom: '12px'}}>
              Performance
            </Text>
            <Stack anchor="center">
              <Meter
                type="circle"
                background="light-2"
                values={[
                  {
                    value: capacity_hot,
                    onHover: (over) => {
                      setActive(over ? rawcapacity_hot : 0);
                      setLabel(over ? 'hot data' : undefined);
                    },
                  },
                  {
                    value: capacity_warm,
                    onHover: (over) => {
                      setActive(over ? rawcapacity_warm : 0);
                      setLabel(over ? 'warm data' : undefined);
                    },
                    onClick: () => {
                      setHighlight(() => !highlight);
                    },
                    highlight,
                  },
                ]}
                // max={inputs.capacity}
                size="small"
                thickness="medium"
              />
              <Box align="center">
                <Box direction="row" align="center" pad={{ bottom: 'xsmall' }}>
                  <Text size="xxlarge" weight="bold">
                    {active || (rawcapacity_hot + rawcapacity_warm) }
                  </Text>
                  <Text>TB</Text>
                </Box>
                <Text>{label || 'raw'}</Text>
              </Box>
            </Stack>
            <Text weight='normal'> { inputs.tiered ? "SSD/HDD vs NL" : "SSD/HDD" }</Text>
          </Box>
        </Grid>
        {/* Node Recommendations */}
        <Box>
          <Box pad="small" gap="small">
            {inputs.adminnodes && <>
              <Text weight="bold" size="2xl" margin={{bottom: '12px'}}>
                Admin Nodes
              </Text>
              <NameValueList valueProps={{ width: 'small' }} pairProps={{ direction: 'column-reverse' }} layout="grid">
                {[
                  { 'name': 'Admin Nodes', 'value': inputs.adminnodecount},
                  { 'name': 'Cores per node', 'value': 24},
                  { 'name': 'Memory per node (GB)', 'value': 192},
                  { 'name': 'Min SSD/NVMe per node', 'value': '2x 480GB' },
                ].map(({name, value}) => (
                  <NameValuePair key={name+value} name={name}>{value}</NameValuePair>
                ))}
              </NameValueList>
            </>}
            <>
              <Text weight="bold" size="2xl" margin={{bottom: '12px'}}>
                Data Nodes
              </Text>
              <NameValueList valueProps={{ width: 'small' }} pairProps={{ direction: 'column-reverse' }} layout="grid">
                {[
                  { 'name': 'Data Nodes', 'value': node_count},
                  { 'name': 'Cores per node', 'value': node_cores},
                  { 'name': 'Memory per node (GB)', 'value': node_memory},
                  { 'name': 'Min SSD/NVMe per node (GB)', 'value': need_ssd ? 'min 2' : 'Optional' },
                  { 'name': 'Min HDD* per node (TB)', 'value': node_hdd},
                  { 'name': 'Min NL** per node (TB)', 'value': node_nl},
                ].map(({name, value}) => (
                  <NameValuePair key={name+value} name={name}>{value}</NameValuePair>
                ))}
              </NameValueList>
            </>
            <Text size='xsmall'>* HDD: 10K or 15K RPM Hard Disk Drives</Text>
            <Text size='xsmall'>** NL: 7200 RPM Hard Disk Drives</Text>
          </Box>
        </Box>
        {/* License Recommendations */}
        <Box pad="small" gap="medium">
            <Text weight="bold" size="2xl">
              Licenses
            </Text>
            <DataTable border sort={{ direction: "asc", external: false, property: "sku" }}
              columns={[
              {
                property: 'qty',
                header: 'Quantity',
              },
              {
                property: 'sku',
                header: 'SKU',
                primary: true,
              },
              {
                property: 'desc',
                header: 'Description'
              },
              ]}
              data={ licenses_needed.filter(l => l.qty > 0) }
            />
        </Box>
        {/* Debug information */}
        {/* <Text size='small'>Inputs: { JSON.stringify(inputs) }</Text> */}
      </Box>
    </Box>
  )
}

export default Nodes