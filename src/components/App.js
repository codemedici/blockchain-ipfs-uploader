import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

class App extends Component {

  async componentWillMount () {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData () {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]

    if (networkData) {
      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(Meme.abi, address)
      this.setState({ contract })
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })
    } else {
      window.alert("Smart contract not deployed to this network")
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer: null,
      memeHash: ''
    };
  }

  async loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.log("You must allow account access to the App via Metamask")
        }
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState( { buffer : Buffer(reader.result) } )
    }
  }

  // hash/path  "QmabjBjvAgJn8m3C2aaACt2ZHQH8QpKqdWsF2ZUjACHa7A"
  // url        https://ipfs.infura.io/ipfs/QmabjBjvAgJn8m3C2aaACt2ZHQH8QpKqdWsF2ZUjACHa7A
  onSubmit = (event) => {
    event.preventDefault()
    ipfs.add(this.state.buffer, (error, result) => {
      const memeHash = result[0].hash
      if(error) {
        console.error(error)
        return
      }

      this.state.contract.methods.set(memeHash).send( {from: this.state.account} ).then( (r)=> {
          
          const result = this.setState({memeHash})
      })
    })
  }

  render() {
  
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the day!
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                
                <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} alt="Meme of the day"/>
                
                <br></br><br></br><br></br>
                <h2>Change Meme (Upload to IPFS!)</h2>
                <br></br>
                <form onSubmit={this.onSubmit} >
                <input type="file" onChange={this.captureFile} />
                <input type='submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
