import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';

import TemperaturePrediction from '../components/TemperaturePrediction';
import WeeklyStats from '../components/WeeklyStats';

function Temperature(){
    return(
        /* On utilise overflow-x-hidden pour éviter les scrolls bizarres avec w-screen */
        <div className="w-screen max-w-full min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
            <Header />
            <main className="container mx-auto pb-12">
                <Content />
                
                {/* On ajoute des marges pour que les composants ne soient pas collés */}
                <div className="flex flex-col gap-8 px-6">
                    <TemperaturePrediction />
                    <WeeklyStats /> 
                </div>
            </main>
        </div>
    )
}

export default Temperature;