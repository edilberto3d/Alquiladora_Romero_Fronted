import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const InconoHeaderComedor = ({ nombreCompleto }) => {
    return (
        <Box textAlign="center">
            <AccountCircleIcon sx={{ fontSize: 40 }} />
            <Typography variant="subtitle1">{nombreCompleto}</Typography>
        </Box>
    );
}

export { InconoHeaderComedor };
