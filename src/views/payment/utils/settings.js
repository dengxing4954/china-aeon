module.exports = {
    siteName: 'AntD Admin & Pro',
    copyright: 'Ant Design Admin  © 2018 sean',
    logoPath: '/logo.svg',
    apiPrefix: '/api/v1',
    fixedHeader: true, // sticky primary layout header
  
    /* Layout configuration, specify which layout to use for route. */
    payment: [
      {
        name: 'CASH',
        interfaces: [
            {}
        ],
        exclude: [/(\/(en|zh))*\/login/],
      },
    ],

}  