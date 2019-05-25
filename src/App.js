import React from 'react'
import './App.css'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Card from '@material-ui/core/Card'

const useStyles = makeStyles(theme => ({
  root: {
    // height: '10px',
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}))

function App() {
  const classes = useStyles()
  return (
    <div className='App'>
      <div className='appBar'>
        <AppBar position='static'>
          <Toolbar variant='dense'>
            <IconButton
              edge='start'
              className={classes.menuButton}
              color='inherit'
              aria-label='Menu'
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' className={classes.title}>
              KodeNames
            </Typography>
            <Button color='inherit'>Login</Button>
          </Toolbar>
        </AppBar>
      </div>
      <table className='table'>
        {new Array(5).fill(1).map(_ => (
          <tr>
            {new Array(5).fill(1).map(_ => (
              <td className='card'> hi</td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  )
}

export default App
