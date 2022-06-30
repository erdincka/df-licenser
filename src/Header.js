import React from 'react';
import {
  Box,
  Button,
  Header,
  Text,
} from 'grommet';
import { Hpe } from 'grommet-icons';

export const HPEHeader = (props) => {

  return (
    <Header
      fill="horizontal" justify='between'
      pad={{ horizontal: 'medium', vertical: 'small' }}
      background="background-front"
    >
      <Button>
        <Box
          direction="row"
          align="start"
          gap="medium"
          pad={{ vertical: 'small' }}
          responsive={false}
          onClick={ () => window.location.reload() }
        >
          <Hpe color="brand" />
          <Box direction="row" gap="xsmall" wrap>
            <Text color="text-strong" weight="bold">
              HPE
            </Text>
            <Text color="text-strong">Ezmeral Data Fabric Storage Sizing - not an official sizer</Text>
          </Box>
        </Box>
      </Button>
      <Box direction='row' border='vertical'>
        { props.buttons.sizerLink }
        { props.buttons.helpLink }
        { props.buttons.docLink }
      </Box>
      <Box direction='row'>
        { props.buttons.expertButton }
        { props.buttons.themeButton }
      </Box>
    </Header>
  );
};