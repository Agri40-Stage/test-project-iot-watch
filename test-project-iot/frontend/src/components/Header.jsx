import React from 'react';

function Header() {
    return (
        <div className='flex flex-row justify-between items-center px-8'>
            <div className=' flex-1 flex items-center'>
                <img className='h-20' src="https://th.bing.com/th/id/OIP.2PDIejApjWb5yA0ZqaFiJgHaHa?rs=1&pid=ImgDetMain" alt="logo" />
            </div>
            <ul className='flex flex-row space-x-4  flex-1 justify-center items-center'>
                <li className='font-medium text-xl cursor-pointer'><a href="">Home</a></li>
                <li className='font-medium text-xl cursor-pointer'><a href="">Temperature</a></li>
                <li className='font-medium text-xl cursor-pointer'><a href="">Humidity</a></li>
            </ul>
            <div className='flex flex-row space-x-4  flex-1 justify-end items-center'>
                <button className='bg-green-500 rounded-b-xl text-white'><a href="">Say Hello!</a></button>
                <button className='bg-green-400 rounded-b-xl text-white'> <a href="">Contact Us!</a></button>
            </div>
        </div>
    );
}

export default Header;
