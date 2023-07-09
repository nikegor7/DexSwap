const { expect } = require("chai")
const { ethers } = require("hardhat");

const toWei = (value) => ethers.utils.parseEther(value.toString());
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );



describe("AddLiquidity", function () {

    let owner ;
    let user ;

    let token0 ;
    let token1 ;
    let tokenStake;
    let factory;
    let router;
    let pair ;
    let library ;
   
    beforeEach(async () =>{
        [owner,user] = await ethers.getSigners();

        const Token0 = await ethers.getContractFactory("MACToken");
        token0 = await Token0.deploy("QWERTY","QWE",toWei(1000000));

        const Token1 = await ethers.getContractFactory("MACToken");
        token1 = await Token1.deploy("ASDFG","ASD",toWei(1000000));

        const Factory = await ethers.getContractFactory("ZuniswapV2Factory");
        factory = await Factory.deploy();

        const Library = await ethers.getContractFactory("ZuniswapV2Library");
        library = await Library.deploy();


       
        // const Router = await ethers.getContractFactory("ZuniswapV2Router");
        // router = await Router.deploy(factory.address);

        const Router = await ethers.getContractFactory("ZuniswapV2Router", {
          libraries: {
            ZuniswapV2Library: library.address,
          },
        });
        router = await Router.deploy(factory.address);

        // pair = await createPair(factory, token0.address, token1.address, owner);
               
    });


describe("addLiquidity", async()=>{
      
      it("adds liquidity", async()=>{
          await token0.approve(router.address, toWei(200));
          await token1.approve(router.address, toWei(200));
          expect(await token0.allowance(owner.address, router.address)).to.equal(toWei(200));

          await router.addLiquidity(token0.address ,token1.address ,toWei(200), toWei(200), toWei(1), toWei(1) , owner.address);
          expect (await router.getReserve0()).to.equal(toWei(200));
          expect (await router.getReserve1()).to.equal(toWei(200));
      })

      it("mints LP tokens", async()=>{
          await token0.approve(router.address, toWei(200));
          await token1.approve(router.address, toWei(200));

          await router.addLiquidity(token0.address ,token1.address ,toWei(200), toWei(200), toWei(1), toWei(1) , owner.address);
          expect(await router.balanceOf(owner.address)).to.equal(toWei(200));
          expect(await router.totalSuply()).to.equal(toWei(200));
      });
});
});