import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

export default function ThemeWrapper(props: { children: any }) {

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: import.meta.env.VITE_THEME_PRIMARY_COLOR ?? '#dac395', },
      secondary: { main: import.meta.env.VITE_THEME_SECONDARY_COLOR ?? '#ffb000', },
    },
  })


  return <ThemeProvider theme={theme}>
    <CssBaseline />
    {props.children}
  </ThemeProvider>

}