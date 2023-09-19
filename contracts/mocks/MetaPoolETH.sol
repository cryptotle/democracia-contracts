// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

import { IWETH } from "./WrappedETH.sol";

/// @notice this is only a mock of the Meta Pool Ethereum Contract.

contract MetaPoolETH is ERC4626 {

    using SafeERC20 for IERC20;

    // *******************
    // * Errors & events *
    // *******************

    error NotSuccessfulOperation();

    constructor(IERC20 _weth) ERC4626(_weth) ERC20("Meta Pool Staked ETH (Testing)", "MpETH") {}

    modifier validDeposit(uint _amount) {
        require(_amount >= 0.01 ether, "Deposit at least 0.01 ETH");
        _;
    }

    /// @notice Deposit ETH
    function depositETH(address _receiver)
        public
        payable
        validDeposit(msg.value)
        returns (uint256)
    {
        uint256 _shares = previewDeposit(msg.value);
        _deposit(msg.sender, _receiver, 0, _shares);
        return _shares;
    }

    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal override {
        // WETH flow
        if (assets != 0) {
            IERC20(asset()).safeTransferFrom(
                msg.sender,
                address(this),
                assets
            );
        // ETH flow
        } else {
            (bool success, ) = asset().call{value: msg.value}(
                abi.encodeWithSignature("deposit(address)", address(this))
            );
            if (!success) { revert NotSuccessfulOperation(); }
        }

        _mint(receiver, shares);

        emit Deposit(caller, receiver, assets, shares);
    }

    /// This burn allows the price of the weth to increase, allowing the testing of
    /// the price increaseing.
    function burn(uint256 _mpeth) public {
        _burn(_msgSender(), _mpeth);
    }

    /// Helper function
    function tellMeTheTime() public view returns (uint256) { return block.timestamp; }
}