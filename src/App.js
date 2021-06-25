import React, { useState } from 'react';
import { Box, Button, Heading, Grommet } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import { Moon, Sun } from 'grommet-icons';
import Nodes from './Nodes';

function App() {
  const [theme, setTheme] = useState('light');
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
      <Box fill pad='small'>
        <AppBar>
          <Heading level='4' margin='none'>Data Fabric License Calculator</Heading>
          <Button 
            icon={ theme === 'dark' ? <Moon /> : <Sun /> } 
            onClick={ () => setTheme( theme === 'dark' ? 'light' : 'dark') } />
        </AppBar>
        <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
          <Box flex align='center' justify='center'>
            <Nodes />
          </Box>
        </Box>
      </Box>
    </Grommet>
  );
}

export default App;
