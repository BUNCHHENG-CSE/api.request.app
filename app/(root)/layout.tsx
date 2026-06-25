import React from 'react';
import Navbar from "@/components/features/main/navbar";
import Footer from "@/components/features/main/footer";

const Layout = ({children,}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div>
            <Navbar/>
            {children}
            <Footer/>
        </div>
    );
};

export default Layout;