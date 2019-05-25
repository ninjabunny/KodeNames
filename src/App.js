import React, { useState } from 'react'
import './App.css'
import InputBase from '@material-ui/core/InputBase'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Drawer from '@material-ui/core/Drawer'
import data from './data'
import gen from 'random-seed'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  drawer: {
    width: '400px',
    flexShrink: 0,
  },
  drawerPaper: {
    width: '400px',
  },
}))

function App() {
  const [seed, setSeed] = useState('')
  const [open, updateOpen] = useState(false)
  const random = gen.create(seed)
  const selectedData = new Array(25)
    .fill(1)
    .map(_ => data.original[random(data.original.length)])
  const classes = useStyles()

  return (
    <div className='App'>
      <div className='appBar'>
        <AppBar position='static'>
          <Toolbar variant='dense'>
            {' '}
            <Typography variant='h6' className={classes.title}>
              KodeNames
            </Typography>
            <InputBase
              placeholder='Seed...'
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onChange={e => setSeed(e.target.value)}
            />
            <IconButton
              edge='start'
              className={classes.menuButton}
              color='inherit'
              aria-label='Menu'
              onClick={() => updateOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
      <table className='table'>
        <tbody>
          {new Array(5).fill(1).map((_, i) => (
            <tr key={`row-${i}`}>
              {new Array(5).fill(1).map((_, j) => {
                return (
                  <Card
                    key={selectedData[i * 5 + j]}
                    word={selectedData[i * 5 + j]}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Drawer
        className={classes.drawer}
        variant='persistent'
        anchor='right'
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
        onClick={() => updateOpen(false)}
      >
        <List>list 1</List>
        <List>list 2</List>
      </Drawer>
    </div>
  )
}

export default App

function Card({ word }) {
  const [selected, setSelected] = useState(false)
  return (
    <td
      className={`card${selected ? ' selected' : ''}`}
      onClick={_ => setSelected(!selected)}
    >
      {word}
    </td>
  )
}
