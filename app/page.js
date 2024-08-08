'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Container,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box sx={{ bgcolor: '#f0f0f0', minHeight: '100vh', p: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Inventory Items
        </Typography>
        <Typography variant="h6" align='center' gutterBottom>
          An Inventory Management Application demo using Next.js, Material UI, and Firebase.
          </Typography>
      <AppBar position="static" sx={{ mb: 4, bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Items
          </Typography>
          <Button color="inherit" onClick={handleOpen}>
            Add New Item
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Grid container spacing={2}>
          {inventory.map(({ name, quantity }) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="inherit">
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeItem(name)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add Item</Typography>
            <IconButton color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            sx={{ mt: 2 }}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}
