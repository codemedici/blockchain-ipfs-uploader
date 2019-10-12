var Meme = artifacts.require("./Meme.sol");

module.exports = function(deployer) {
  deployer.deploy(Meme);
};