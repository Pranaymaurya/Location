import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Paper, Typography, Button, CircularProgress, 
  List, ListItem, Divider, Box, Alert 
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/v3/getuser', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md"><Alert severity="error">{error}</Alert></Container>;

  const { name, email, location, addresses, updatedAt } = user;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">User Profile</Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        
        <Box mb={3}>
          <Typography variant="body1"><strong>Name:</strong> {name}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Locations</Typography>
          <List>
            {location.map((loc, i) => <ListItem key={i}>{loc}</ListItem>)}
          </List>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/location')}>
            Add Location
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Addresses</Typography>
          <List>
            {addresses.map((addr, i) => (
              <ListItem key={i} sx={{ flexDirection: 'column', alignItems: 'flex-start', bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{addr.label}</Typography>
                <Typography><strong>Street:</strong> {addr.street}</Typography>
                <Typography><strong>City:</strong> {addr.city}, {addr.state}</Typography>
                <Typography><strong>Country:</strong> {addr.country} {addr.postalCode}</Typography>
              </ListItem>
            ))}
          </List>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/address')}>
            Add Address
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(updatedAt).toLocaleString()}
        </Typography>
      </Paper>
    </Container>
  );
};

export default UserProfile;