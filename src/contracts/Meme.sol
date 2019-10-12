pragma solidity 0.5.0;

contract Meme {

  string ipfsHash;

  function set(string memory _x) public {
    ipfsHash = _x;
  }

  function get() public view returns (string memory) {
    return ipfsHash;
  }

}
