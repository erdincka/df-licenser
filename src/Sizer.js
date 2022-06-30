import React, { useState } from 'react';
import { Box, TextInput, FormField, CheckBox, Text, Form, Grid, Meter, DataTable, Stack, MaskedInput, RangeInput, Select, Tip, Anchor } from 'grommet';
import services from './services';

function Sizer(mode) {

  const [inputs, setInputs] = useState({ capacity: 100, tiered: false, tierratio: 30, ec:"4:2", tier0_count: 0 });
  const [active, setActive] = useState(0);
  const [label, setLabel] = useState('');
  const [diskcount, setDiskcount] = useState(undefined);
  const [diskcapacity, setDiskcapacity] = useState(undefined);
  
  // Fixed parameters below
  const licenses = [
    { sku: 'R9J44AAE', desc: 'HPE Ezmeral Data Fab File Object E-LTU' },
    { sku: 'R9J47AAE', desc: 'HPE Ezmeral Data Fab Analytics Premium Pack E-LTU' },
    { sku: 'MoSMB', desc: 'Ryussi MoSMB, contact to HILS!' },
  ]

  const ps = [
    { sku : 'HU1E8A1', desc: 'Ezmeral Staff Augmentation Block of Hours: 40 hours - T&E Excluded' }
  ]

  const drives = {
    'tier0': [
      { size: 0.96, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 1.6, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 1.92, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 3.2, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 3.84, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 6.4, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 7.68, label: 'TB SSD', speed: '100', format: 'sff' },
      { size: 15.36, label: 'TB SSD', speed: '100', format: 'sff' },
    ],
    'tier1': [
      // { size: 0.9, label: 'TB SAS', speed: 10, format: 'lff' },
      // { size: 1.2, label: 'TB SAS', speed: 10, format: 'lff' },
      // { size: 2.4, label: 'TB SAS', speed: 10, format: 'lff' },
    ].concat([1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(size => 
      ({ size, label: 'TB SATA', speed: 7, format: 'lff'} )
    )),
    'tier2': [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(size => 
      ({ size, label: 'TB SATA', speed: 7, format: 'lff'} )
    )
    ,
  }

  const min_tier0_drives = 1;
  const min_tier1_drives = 3;
  const min_tier2_drives = 3;
  // Considering Apollo 4200 with 24 LFF + 4 SFF or 48 SFF + 4 LFF
  const use_lff = true // inputs.use_lff;
  const max_ssd_slots = use_lff ? 4 : 8;
  const node_max_disks = use_lff ? 28 : 56;
  const hot_tier_overhead = 4; // TODO: revise this overhead
  const default_tier0_drive = drives.tier0[2];
  const default_tier1_drive = drives.tier1[2];
  const default_tier2_drive = drives.tier2[6];
  // Performance figures
  const tier0_disk_MBps = 500; // SSD read performance
  const tier1_disk_MBps = use_lff ? 80 : 120; // 7K vs 10K read performance
  const tier2_disk_MBps = use_lff ? 80 : 120;
  const node_network_min_MBps = 2 * 10 * 1000 / 8; // Min 2x 10Gb links in MB/s

  // Calculated parameters below
  const ec_scheme = inputs.ec.split(':').map(n => Number(n))
  // TODO: consider other factors for node count - max node capacity, performance, recovery times...
  const selected_services = services.filter( s => s.id in inputs && inputs[s.id] );
  const node_count_min = Number((inputs.tiered ? ec_scheme.reduce((a, b) => a + b, 2) : 5));
  let node_cores = 16 + selected_services.map(s => s.cores).reduce( (a,b) => a + b, 0);
  const node_memory = 64 + selected_services.map(s => s.memory).reduce( (a,b) => a + b, 0);
  const need_ssd = selected_services.map(s => s.ssd).some(s => s);
  const capacity_hot = Math.ceil(Number(inputs.tiered ? inputs.capacity * (inputs.tierratio/100) : inputs.capacity));
  const capacity_warm = Math.ceil(Number(inputs.tiered ? inputs.capacity * (1-inputs.tierratio/100) : 0));
  const warm_tier_overhead = ( ec_scheme.reduce(( a, b ) => a + b, 0 ) / (ec_scheme[0] || 1) );

  const raw_capacity_hot = Math.ceil( capacity_hot * hot_tier_overhead );
  const raw_capacity_warm = Math.ceil(capacity_warm * warm_tier_overhead);
  
  const tier0_size = Number(inputs.tier0?.size || default_tier0_drive.size);
  const tier1_size = Number(inputs.tier1?.size || default_tier1_drive.size);
  const tier2_size = Number(inputs.tier2?.size || default_tier2_drive.size);
  const raw_capacity_total = raw_capacity_hot + raw_capacity_warm;

  const node_tier0_needed = need_ssd ? min_tier0_drives : 0;
  const total_tier1_needed = Math.ceil(raw_capacity_hot / tier1_size);
  const total_tier2_needed = inputs.tiered ? Math.ceil(raw_capacity_warm / tier2_size) : 0;
  const total_drives_needed = total_tier1_needed + total_tier2_needed; // Tier0 is not considered in disk slot requirements
  const node_count_min_for_capacity = Math.ceil(total_drives_needed / node_max_disks);
  
  let node_count = Math.max(node_count_min, node_count_min_for_capacity);
  
  const node_tier0_count = Math.max(inputs.tier0_count || 0, node_tier0_needed);
  let node_tier1_count = Math.max(Math.ceil(total_tier1_needed / node_count), min_tier1_drives);
  let node_tier2_count = Math.max(Math.ceil(total_tier2_needed / node_count), inputs.tiered ? min_tier2_drives : 0);
  
  // Check if node can accommodate those many disks - in corner cases we might have more drives that will be put in a node
  if ((node_tier1_count + node_tier2_count) > node_max_disks) {
    node_count += 1;
    node_tier1_count = Math.max(Math.ceil(total_tier1_needed / node_count), min_tier1_drives);
    node_tier2_count = Math.max(Math.ceil(total_tier2_needed / node_count), inputs.tiered ? min_tier2_drives : 0);
  }

  // Performance calculations including SSD throughput
  const node_disk_max_MBps = (node_tier0_count * tier0_disk_MBps) + (node_tier1_count * tier1_disk_MBps) + (node_tier2_count * tier2_disk_MBps)
  // Required min network speed (2 NICs)
  const node_network_nic_speed = (node_disk_max_MBps / node_network_min_MBps) > 1 ? 25 : 10 // Gbps
  const node_network_max_MBps = node_network_nic_speed * 2 * 1000 / 8; // Max network MB/s

  // Adjust for additonal MFS cores
  node_cores += 2 * Math.ceil((node_disk_max_MBps * 8 / 1000 - 10) / 10); // add 2 cores per 10Gb/s after first 10Gb/s throughput
  // Node and cluster totals
  const node_available_disk_slots = node_max_disks - (node_tier1_count + node_tier2_count);

  // Available capacity if all slots were populated by largest drive size
  const node_max_tier0_capacity = max_ssd_slots * drives.tier0[drives.tier0.length - 1].size;
  const node_max_tier1_capacity = node_max_disks * drives.tier1[drives.tier1.length - 1].size;
  const node_max_tier2_capacity = node_max_disks * drives.tier2[drives.tier2.length - 1].size;

  // Node totals
  const node_installed_tier0_capacity = node_tier0_count * tier0_size; // Float
  const node_installed_tier1_capacity = node_tier1_count * tier1_size; // Float
  const node_installed_tier2_capacity = node_tier2_count * tier2_size; // Float
  // Cluster Totals for licensing
  const cluster_installed_tier0_capacity = Math.ceil(node_count * node_installed_tier0_capacity);
  const cluster_installed_tier1_capacity = Math.ceil(node_count * node_installed_tier1_capacity);
  const cluster_installed_tier2_capacity = Math.ceil(node_count * node_installed_tier2_capacity);

  const licenses_needed = licenses.map(license => {
    switch(license.sku){
      case 'R9J44AAE':
        license.qty = Math.ceil(cluster_installed_tier0_capacity + cluster_installed_tier1_capacity + cluster_installed_tier2_capacity)
        break;
      case 'R9J47AAE':
        license.qty = inputs.dbevents ? node_count * node_cores : 0;
        break;
      case 'mosmb':
        license.qty = inputs.smb ? node_count : 0
        break;
      default:
        license.qty = 0
    }
    return license
  });
  const ps_needed = ps.map(s => {
    switch(s.sku){
      case 'HU1E8A1':
        s.qty = Math.max(Math.ceil(node_count / 50), Math.ceil((cluster_installed_tier0_capacity + cluster_installed_tier1_capacity + cluster_installed_tier2_capacity) / 2500))
        break;
      default:
        s.qty = 0
    }
    return s
  });
  
  return (
    <Box margin='small'>
      {/* Debug */}
      {/* <Text size='small'>max disk read: { JSON.stringify(node_disk_max_MBps) }</Text> */}
      <Box gap='small' direction='row' justify='between' elevation='small'>
        {/* Inputs */}
        <Form
          value={ inputs } validate="blur"
          onChange={ nextValue => setInputs(nextValue) }
        >
          <Text weight={'bold'}>Capacity</Text>
          <Box direction="row" gap="medium">
            <FormField name="capacity" htmlFor="capacity" label='Usable TB'>
              <Tip content='Minimum 30TB'>
                <TextInput type='number' id='capacity' name='capacity' min={30} step='10' />
              </Tip>
            </FormField>
            {/* {mode.expert &&
              <Tip content='Similar to Apollo 4200 with "24 LFF + 4 SFF" or "48 SFF + 4 LFF"'>
                <FormField name="use_lff" htmlFor="use_lff" label="Node size">
                  <CheckBox id="use_lff" name="use_lff" toggle defaultChecked />
                </FormField>
              </Tip>
            } */}
            <FormField name="tiered" htmlFor="tiered"
              label={<Anchor href='https://docs.datafabric.hpe.com/70/StorageTiers/Intro.html'
              target='_blank'>Tiered</Anchor>}
            >
              <CheckBox id="tiered" name="tiered" toggle defaultChecked/>
            </FormField>
            {inputs.tiered && mode.expert && <FormField name="ec" htmlFor="ec"
              label={ <Anchor href='https://docs.datafabric.hpe.com/70/StorageTiers/SelectECScheme.html' target='_blank'>EC Scheme</Anchor> } >
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
          <Box direction='row'>
            <FormField name="tier0" htmlFor="tier0" label="SSD Disk Size">
              <Select id="tier0"
                options={ drives.tier0 }
                valueKey="size"
                labelKey={ (option => option.size + option.label) }
                children={ (option) => (option.size + option.label) }
                defaultValue= { default_tier0_drive }
              />
            </FormField>
            <FormField name="tier1" htmlFor="tier1" label="Hot Tier Disk Size">
              <Select id="tier1" name="tier1" 
                options={drives.tier1.filter(d => d.format === (use_lff ? 'lff' : 'sff'))}
                valueKey="size" 
                labelKey={ (option => option.size + option.label + ' ' + option.format.toUpperCase()) }
                children={(option) => (option.size + option.label + ' ' + option.format.toUpperCase())}
                defaultValue= { default_tier1_drive }
                />
            </FormField>
            { inputs.tiered &&
              <FormField name="tier2" htmlFor="tier2" label="Warm Tier Disk Size">
                <Select id="tier2" name="tier2" 
                  options={drives.tier2.filter(d => d.format === (use_lff ? 'lff' : 'sff'))}
                  valueKey="size" 
                  labelKey={ (option => option.size + option.label + ' ' + option.format.toUpperCase()) }
                  children={ (option) => (option.size + option.label + ' ' + option.format.toUpperCase()) }  
                  defaultValue= { default_tier2_drive }
                  />
              </FormField>
            }
          </Box>
          { mode.expert && <Text weight={'bold'}>Data Services</Text> }
          { mode.expert && 
            <Grid columns={{ count: 3, size: 'auto' }} gap="small">
              {
              services.map(service => 
                (
                  <Box key={service.id}>
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
        {/* Raw capacity needed */}
        <Box pad="small" gap="small" align='center' justify='end'>
          <Text weight="bold" size="small" margin={{bottom: '12px'}}>
            Required Raw
          </Text>
          <Stack anchor="bottom">
            <Meter round
              type="semicircle"
              values={[
                {
                  color: 'graph-1',
                  value: raw_capacity_hot,
                  onHover: (over) => {
                    setActive(over ? raw_capacity_hot : 0);
                    setLabel(over ? 'Hot' : undefined);
                  },
                },
                {
                  color: 'graph-2',
                  value: raw_capacity_warm,
                  onHover: (over) => {
                    setActive(over ? raw_capacity_warm : 0);
                    setLabel(over ? 'Warm' : undefined);
                  },
                },
              ]}
              size="small"
            />
            <Box align="center">
              <Box direction="row" align="center" pad={{ bottom: 'xsmall' }}>
                <Text size="large" weight="bold">
                  {active || raw_capacity_total }
                </Text>
                <Text size='xsmall'>TB { label || 'raw'}</Text>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
      {/* Recommendations */}
      <Box elevation='small'>
        <Text weight='bold' size='large' color='brand'>Recommeded Configuration</Text>
        {/* Node Recommendations */}
        <Box direction='row' justify='between'>
          {/* Node configuration */}
          <Box pad='small' gap='small'>
            <Anchor weight="bold" size="2xl" margin={{ bottom: '12px' }}
              href='https://docs.datafabric.hpe.com/70/AdvancedInstallation/PlanningtheCluster-hardware.html' target='_blank'>
              { node_count }x Nodes
            </Anchor>
              <DataTable border
                columns={[
                {
                  property: 'name',
                  header: 'Per Node',
                },
                {
                  property: 'value',
                  header: 'Quantity',
                },
                {
                  property: 'utilisation',
                  header: 'Utilisation*',
                },
                ]}
                data={ 
                  [
                    { 'name': 'CPU', 'value': node_cores + ' cores', 'utilisation': <Stack anchor="center">
                      <Meter type='bar' value={ node_cores } max={ 128 } />
                        <Text size="medium" weight="bold">
                          { node_cores } of { 128 } cores
                        </Text>
                    </Stack>},
                    { 'name': 'Memory', 'value': node_memory + ' GB' , 'utilisation': <Stack anchor="center">
                    <Meter type='bar' value={ node_memory } max={ 3072 } />
                      <Text size="medium" weight="bold">
                        { node_memory }GB of { 3072 }GB
                      </Text>
                  </Stack>},
                    {
                      'name': 'SSD',
                      'value': <TextInput type='number' id='tier0_count' size='small'
                          placeholder={ need_ssd ? min_tier0_drives : 'Optional' }
                          min={ node_tier0_needed } max={ max_ssd_slots }
                          value={ Math.min( node_tier0_count, Math.max(inputs.tier0_count, node_tier0_needed) ) }
                          onChange={(event) => setInputs(old => ({ ...old, tier0_count: Number(event.target.value) }))}
                        />,
                      'utilisation': <Stack anchor="center">
                        <Meter type='bar' value={ node_installed_tier0_capacity } max={ node_max_tier0_capacity } />
                          <Text size="medium" weight="bold">
                            { Math.ceil(node_installed_tier0_capacity) }TB of { node_max_tier0_capacity }TB
                          </Text>
                      </Stack>
                    },
                    { 'name': 'Hot Tier', 'value': node_tier1_count + 'x ' + tier1_size + 'TB SAS' , 'utilisation': <Stack anchor="center">
                    <Meter type='bar' value={ node_installed_tier1_capacity } max={ node_max_tier1_capacity } />
                      <Text size="medium" weight="bold">
                        { Math.ceil(node_installed_tier1_capacity) }TB of { node_max_tier1_capacity }TB
                      </Text>
                  </Stack>},
                    ...(inputs.tiered ? [{ 'name': 'Warm Tier', 'value': node_tier2_count + 'x ' + tier2_size + 'TB SATA', 'utilisation': <Stack anchor="center">
                    <Meter type='bar' value={ node_installed_tier2_capacity } max={ node_max_tier2_capacity } />
                      <Text size="medium" weight="bold">
                        { Math.ceil(node_installed_tier2_capacity) }TB of { node_max_tier2_capacity }TB
                      </Text>
                  </Stack>},] : [])
                  ]
                }
              />
            <Anchor size='xsmall' href='https://www.hpe.com/psnow/doc/a50002573enw.html?jumpid=in_pdp-psnow-qs' target='_blank'>
              * Reference HPE Apollo 4200 with {node_max_disks}x LFF + {max_ssd_slots}x SFF SSDs
            </Anchor>
          </Box>
          {/* Node output */}
          <Box pad="medium" align='center' justify='end'>
            <Text weight="bold" size="xl" margin={{ bottom: '12px' }}>
              Components
            </Text>
            {/* Other resources */}
            <DataTable fill
              columns={[
                {
                  property: 'name',
                  header: '',
                },
                {
                  property: 'value',
                  header: 'Quantity',
                },
                {
                  property: 'description',
                  header: 'Description',
                },
              ]} 
              data={
                [
                  {
                    "name": "OS Drives",
                    "value": "2x",
                    "description": "480GB SSD"
                  },
                  {
                    "name": "Network",
                    "value": "2x",
                    "description": node_network_nic_speed + 'Gbps'
                  },
                ]
              }
            />
            {/* Drive configuration */}
            <Text weight="bold" size="xl" margin={{bottom: '12px'}}>
              Drives
            </Text>
            <Stack anchor='right'>
              <Meter round
                type="bar"
                values={[
                  { color:'graph-0', value: node_tier0_count, onHover: (over) => { setDiskcount(over ? node_tier0_count + ' SSDs' : undefined) } },
                  { color:'graph-1', value: node_tier1_count, onHover: (over) => { setDiskcount(over ? node_tier1_count + ' hot tier drives' : undefined) } },
                  { color:'graph-2', value: node_tier2_count, onHover: (over) => { setDiskcount(over ? node_tier2_count + ' warm tier drives' : undefined) } },
                  { color:'background', value: node_available_disk_slots, onHover: (over) => { setDiskcount(over ? (node_available_disk_slots + max_ssd_slots) + ' free slot(s)' : undefined) } },
                ]}
              />
              <Text>{ diskcount || (node_max_disks + max_ssd_slots) + ' slots' }</Text>
            </Stack>
          </Box>
        </Box>
        {/* License & Service Recommendations */}
        <Box pad="small" gap="medium">
          <Anchor weight="bold" size="xl"
            href='https://docs.datafabric.hpe.com/70/c-product-licensing-tmp.html' target='_blank'>
              Licenses & Professional Services
          </Anchor>
          <DataTable border sort={{ direction: "asc", property: "sku" }}
            columns={[
            {
              property: 'qty',
              header: 'Quantity',
            },
            {
              property: 'sku',
              header: 'SKU',
            },
            {
              property: 'desc',
              header: 'Description'
            },
            ]}
            data={ licenses_needed.concat(ps_needed).filter(l => l.qty > 0) }
          />
        </Box>
      </Box>
      {/* Resulting Cluster */}
      <Box pad="small" gap="small">
        <Text weight="bold" size="2xl" margin={{bottom: '12px'}}>
          Cluster
        </Text>
        <Grid columns={ { count: 4, size: 'auto' }} gap="small">
          <Stack anchor='left' fill>
            <Meter type='bar' value={ node_count * node_cores } max={ node_count * 128 } thickness='large' />
            <Box direction="row" align='center' justify='between'>
              <Text weight="bold" margin='xsmall'>
                { node_count * node_cores } / { node_count * 128 }
              </Text>
              <Text size="small" margin='xsmall'>cores</Text>
            </Box>
          </Stack>
          <Stack anchor='left' fill>
            <Meter type='bar' value={ node_count * node_memory } max={ node_count * 3072 } thickness='large' />
            <Box direction="row" align='center' justify='between'>
              <Text weight="bold" margin='xsmall'>
                { node_count * node_memory } / { node_count * 3072 }
              </Text>
              <Text size="small" margin='xsmall'>GB memory</Text>
            </Box>
          </Stack>
          <Stack anchor='left'>
            <Meter type='bar'
              values={[
                { color:'graph-0', value: Math.ceil(node_count * node_installed_tier0_capacity), onHover: (over) => { setDiskcapacity(over ? Math.ceil(node_count * node_installed_tier0_capacity) + ' SSD' : undefined) } },
                { color:'graph-1', value: Math.ceil(node_count * node_installed_tier1_capacity), onHover: (over) => { setDiskcapacity(over ? Math.ceil(node_count * node_installed_tier1_capacity) + ' Hot' : undefined) } },
                { color:'graph-2', value: Math.ceil(node_count * node_installed_tier2_capacity), onHover: (over) => { setDiskcapacity(over ? Math.ceil(node_count * node_installed_tier2_capacity) + ' Warm' : undefined) } },
              ]}
              thickness='large' />
            <Box direction="row" align='center'>
              <Text margin='xsmall' weight='bold'>{diskcapacity || (cluster_installed_tier0_capacity + cluster_installed_tier1_capacity + cluster_installed_tier2_capacity)}</Text>
              <Text size='small'>TB Capacity</Text>
            </Box>
          </Stack>
          <Stack anchor='left' fill>
            <Meter type='bar' value={ node_count * node_disk_max_MBps } thickness='large' />
            <Box direction="row" align='center' justify='between'>
              <Text size="large" weight="bold" margin='xsmall'>
                { node_count * Math.min(node_disk_max_MBps, node_network_max_MBps) / 1000 }
              </Text>
              <Text size="small" margin='xsmall'>GB per second Tput</Text>
            </Box>
          </Stack>
        </Grid>
      </Box>
    </Box>
  )
}

export default Sizer
