import React, { useState } from 'react';
import { Box, Button, Heading, Grommet } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import { Moon, Sun, Switch } from 'grommet-icons';
import Inputs from './Inputs';
// import Nodes from './Nodes';
// import Volumes from './Volumes';

function App() {
  const [theme, setTheme] = useState('dark');
  const [expert, setExpert] = useState(true);
  const AppBar = (props) => (
    <Box
      tag='header'
      direction='row'
      align='center'
      justify='between'
      background='brand'
      pad={{ left: 'medium', right: 'small', vertical: 'small' }}
      elevation='medium'
      style={{ zIndex: '1' }}
      {...props}
    />
  );
  return (
    <Grommet theme={hpe} themeMode={theme} full>
      <Box fill gap='small'>
        <AppBar>
          <Heading level='4' margin='none'>Ezmeral Data Fabric Sizing Tool</Heading>
          <Box direction='row' alignSelf='end'>
            <Button
              icon={ expert ? <Switch color='red' /> : <Switch /> } 
              onClick={ () => setExpert( old => !old ) } />
            <Button
              icon={ theme === 'dark' ? <Moon /> : <Sun /> } 
              onClick={ () => setTheme( theme === 'dark' ? 'light' : 'dark') } />
          </Box>
        </AppBar>

        {/* <Card animation="fadeIn" margin="xsmall" pad="small" fill flex> */}
          {/* <Volumes /> */}
          <Inputs expert={expert} />
        {/* </Card> */}
        
        {/* <Card animation="fadeIn" margin="xsmall" pad="small">
          <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
            <Box flex align='center' justify='center'>
              <Nodes />
            </Box>
          </Box>
        </Card> */}
      
      </Box>
    </Grommet>
  );
}

export default App;
