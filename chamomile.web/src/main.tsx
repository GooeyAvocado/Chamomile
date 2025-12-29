import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import ThemeWrapper from './ThemeWrapper.tsx'
import Home from './components/pages/Home.tsx'
import { PingPongProvider } from './components/contexts/PingPongContext.tsx'
import DimensionsProvider from './components/contexts/DimensionsContext.tsx'
import { LoraProvider } from './components/contexts/LoraContext.tsx'
import PromptProvider from './components/contexts/PromptContext.tsx'
import { ImageUploadProvider } from './components/contexts/ImageUploadContext.tsx'
import FullPageDropzone from './components/shared/FullPageDropzone.tsx'
import { UpscalersProvider } from './components/contexts/UpscalersContext.tsx'
import QueueWatcher from './components/services/QueueWatcher.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import DisplayPage from './components/pages/DisplayPage.tsx'
import { AlbumsProvider } from './components/contexts/AlbumsContext.tsx'
import QueueProvider from './components/contexts/QueueContext.tsx'
import { SettingsProvider } from './components/contexts/SettingsContext.tsx'
import GridsPage from './components/pages/GridsPage.tsx'
import { CheckpointProvider } from './components/contexts/CheckpointsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    {/* There are so many providers  */}

    <DimensionsProvider>
      <ThemeWrapper>
        <SettingsProvider>
          <PingPongProvider>
            <PromptProvider>
              <CheckpointProvider>
                <LoraProvider>
                  <AlbumsProvider>
                    <ImageUploadProvider>
                      <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={1500} transitionDuration={250} >
                        <UpscalersProvider>
                          <QueueProvider>
                            <HashRouter>
                              <Routes>
                                <Route path="/grid/*" element={
                                  <QueueWatcher>
                                    <GridsPage />
                                  </QueueWatcher>
                                }
                                />
                                <Route path="*" element={
                                  <QueueWatcher>
                                    <FullPageDropzone>
                                      <Home />
                                    </FullPageDropzone>
                                  </QueueWatcher>
                                }
                                />
                                <Route path="/display" element={< DisplayPage />} />
                              </Routes>
                            </HashRouter>
                          </QueueProvider>


                        </UpscalersProvider>
                      </SnackbarProvider>
                    </ImageUploadProvider>
                  </AlbumsProvider>
                </LoraProvider>
              </CheckpointProvider>
            </PromptProvider>
          </PingPongProvider>
        </SettingsProvider>
      </ThemeWrapper>
    </DimensionsProvider>

  </StrictMode >,
)