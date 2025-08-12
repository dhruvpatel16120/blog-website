"use client"

import Header from './Header';

const ClientHeader = ({ scrolled = false }) => {
  return <Header scrolled={scrolled} />;
};

export default ClientHeader;
