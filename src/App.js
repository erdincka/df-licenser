import React, { useState } from 'react';
import { Box, Button, Grommet } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import { CircleQuestion, Link, Moon, Sun, Switch, UserExpert } from 'grommet-icons';
import Sizer from './Sizer';
import { HPEHeader } from './Header';
// import Nodes from './Nodes';
// import Volumes from './Volumes';

function App() {
  const [theme, setTheme] = useState('dark');
  const [expert, setExpert] = useState(false);

  const expertButton = <Button
    tip='Simple vs detailed'
    icon={ expert ? <Switch color='red' /> : <Switch /> } 
    onClick={ () => setExpert( old => !old ) } />

  const themeButton = <Button
    tip='Switch theme'
    icon={ theme === 'dark' ? <Moon /> : <Sun /> } 
    onClick={ () => setTheme( theme === 'dark' ? 'light' : 'dark') } />

  const sizerLink = <Button
    tip='Advanced sizing with EPASizer'
    icon={ <Link /> } 
    onClick={ () => window.open('https://solutionsizers.ext.hpe.com/EPASizer/', '_blank') } />
  
  const helpLink = <Button
    tip='Contact a champion for help'
    icon={ <UserExpert /> } 
    onClick={ () => window.open('https://hpe.sharepoint.com/sites/ezmeral/SitePages/Ezmeral-Champions.aspx', '_blank') } />

  const docLink = <Button
    tip='Sizing Help'
    icon={ <CircleQuestion /> } 
    onClick={ () => window.open('https://hpe.sharepoint.com/sites/ezmeral/SitePages/Sizing.aspx', '_blank') } />

  return (
    <Grommet theme={hpe} themeMode={theme} full>
      <Box  gap='small'>
        <HPEHeader buttons={ { expertButton, themeButton, sizerLink, helpLink, docLink } } />
        <Sizer expert={expert} />
        {/* <Volumes /> */}
        {/* <Nodes /> */}
      
      </Box>
    </Grommet>
  );
}

export default App;
