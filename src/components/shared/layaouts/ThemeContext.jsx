import React, { createContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const getStoredTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    try {
      const parsedTheme = storedTheme ? JSON.parse(storedTheme) : 'light';

     
      if (parsedTheme === 'light' || parsedTheme === 'dark') {
        return parsedTheme;
      } else {
        console.warn('Tema inválido encontrado, se usará el tema predeterminado (light).');
        return 'light'; 
      }
    } catch (error) {
      console.error('Error al obtener el tema de localStorage, usando tema predeterminado (light):', error);
      return 'light';
    }
  };

  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    try {
     
      if (theme === 'light' || theme === 'dark') {
        localStorage.setItem('theme', JSON.stringify(theme));
      } else {
        console.warn('Intento de guardar un tema inválido, se ignorará.');
      }
    } catch (error) {
      console.error('Error al almacenar el tema en localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
