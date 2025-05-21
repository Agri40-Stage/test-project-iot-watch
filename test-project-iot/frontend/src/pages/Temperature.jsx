import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';

function Temperature(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <Content />
    </div>
    )
}

export default Temperature;