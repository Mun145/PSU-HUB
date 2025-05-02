//path: psu-hub-frontend/src/pages/CertificatesAdmin.js
import React,{useEffect,useState} from 'react';
import { Container, Typography, Table, TableHead,TableRow,TableCell,
         TableBody, IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import fullUrl from '../utils/fullUrl';

export default function CertificatesAdmin(){
  const [rows,setRows]=useState([]);

  useEffect(()=>{
    api.get('/certificates/all')
       .then(r=>setRows(r.data.data))
       .catch(()=>toast.error('Error loading certificates'));
  },[]);

  const reIssue = (eId,uId)=> api
    .post(`/admin/certificates/${eId}/reissue/${uId}`)
    .then(({data})=>{
       toast.success('Re-issued');        // update UI
       setRows(rows.map(r=> r.id===data.data.id? data.data : r));
    });

  const revoke  = (eId,uId)=> api
    .delete(`/admin/certificates/${eId}/${uId}`)
    .then(()=>{ toast.success('Revoked'); setRows(rows.filter(r=>(r.eventId!==eId||r.userId!==uId))); });

  return (
    <Container sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Certificates</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell><TableCell>Event</TableCell>
            <TableCell>Issued</TableCell><TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {rows.map(r=>(
          <TableRow key={r.id}>
            <TableCell>{r.User?.name}</TableCell>
            <TableCell>{r.Event?.title}</TableCell>
            <TableCell>{new Date(r.issuedAt).toLocaleDateString()}</TableCell>
            <TableCell align="right">
              {r.fileUrl &&
                <IconButton onClick={()=> window.open(fullUrl(r.fileUrl), '_blank','noopener,noreferrer')}  >
                  <PictureAsPdfIcon/>
                </IconButton>}
              <IconButton onClick={()=>reIssue(r.eventId,r.userId)}><ReplayIcon/></IconButton>
              <IconButton onClick={()=>revoke(r.eventId,r.userId)}><DeleteIcon/></IconButton>
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </Container>
  )
}
