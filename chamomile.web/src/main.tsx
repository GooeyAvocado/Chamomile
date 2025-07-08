import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import ThemeWrapper from './ThemeWrapper.tsx'
import Home from './components/pages/Home.tsx'
import { PingPongProvider } from './components/contexts/PingPongContext.tsx'
import DimensionsProvider from './components/contexts/DimensionsContext.tsx'
import { ModelProvider } from './components/contexts/ModelsContext.tsx'
import { LoraProvider } from './components/contexts/LoraContext.tsx'
import PromptProvider from './components/contexts/PromptContext.tsx'
import { ImageUploadProvider } from './components/contexts/ImageUploadContext.tsx'
import FullPageDropzone from './components/shared/FullPageDropzone.tsx'
import { UpscalersProvider } from './components/contexts/UpscalersContext.tsx'
import QueueWatcher from './components/services/QueueWatcher.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import DisplayPage from './components/pages/DisplayPage.tsx'
import { AlbumsProvider } from './components/contexts/AlbumsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    {/* There are so many providers  */}
    <DimensionsProvider>
      <ThemeWrapper>
        <PingPongProvider>
          <PromptProvider>
            <ModelProvider>
              <LoraProvider>
                <AlbumsProvider>
                  <UpscalersProvider>
                    <ImageUploadProvider>
                      <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} >
                        <HashRouter>
                          <Routes>
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
                      </SnackbarProvider>
                    </ImageUploadProvider>
                  </UpscalersProvider>
                </AlbumsProvider>
              </LoraProvider>
            </ModelProvider>
          </PromptProvider>
        </PingPongProvider>
      </ThemeWrapper>
    </DimensionsProvider>
  </StrictMode >,
)