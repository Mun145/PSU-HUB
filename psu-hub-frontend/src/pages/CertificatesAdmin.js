//path: psu-hub-frontend/src/pages/CertificatesAdmin.js
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableHead,
  TableRow, 
  TableCell,
  TableBody, 
  IconButton,
  Paper,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  TableContainer,
  Chip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import fullUrl from '../utils/fullUrl';

export default function CertificatesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/certificates/all')
       .then(r => {
         setRows(r.data.data);
         setLoading(false);
       })
       .catch(() => {
         toast.error('Error loading certificates');
         setLoading(false);
       });
  }, []);

  const reIssue = (eId, uId) => api
    .post(`/admin/certificates/${eId}/reissue/${uId}`)
    .then(({data}) => {
       toast.success('Certificate re-issued successfully');
       setRows(rows.map(r => r.id === data.data.id ? data.data : r));
    })
    .catch(() => toast.error('Failed to re-issue certificate'));

  const revoke = (eId, uId) => api
    .delete(`/admin/certificates/${eId}/${uId}`)
    .then(() => { 
      toast.success('Certificate revoked successfully'); 
      setRows(rows.filter(r => (r.eventId !== eId || r.userId !== uId))); 
    })
    .catch(() => toast.error('Failed to revoke certificate'));

  const filteredRows = rows.filter(row => 
    row.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.Event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Certificate Management
        </Typography>
        <TextField
          size="small"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No certificates found matching your search' : 'No certificates available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(r => (
                <TableRow 
                  key={r.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {r.User?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.Event?.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={new Date(r.issuedAt).toLocaleDateString()}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {r.fileUrl && (
                      <Tooltip title="View Certificate">
                        <IconButton 
                          onClick={() => window.open(fullUrl(r.fileUrl), '_blank', 'noopener,noreferrer')}
                          color="primary"
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Re-issue Certificate">
                      <IconButton 
                        onClick={() => reIssue(r.eventId, r.userId)}
                        color="success"
                      >
                        <ReplayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Revoke Certificate">
                      <IconButton 
                        onClick={() => revoke(r.eventId, r.userId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
