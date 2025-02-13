import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import ThemeWrapper from './ThemeWrapper.tsx'
import App from './App.tsx'
import { PingPongProvider } from './components/contexts/PingPongContext.tsx'
import DimensionsProvider from './components/contexts/DimensionsContext.tsx'
import { ModelProvider } from './components/contexts/ModelsContext.tsx'
import { LoraProvider } from './components/contexts/LoraContext.tsx'
import PromptProvider from './components/contexts/PromptContext.tsx'
import { ImageUploadProvider } from './components/contexts/ImageUploadContext.tsx'
import FullPageDropzone from './components/shared/FullPageDropzone.tsx'
import { UpscalersProvider } from './components/contexts/UpscalersContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <DimensionsProvider>
      <ThemeWrapper>
        <PingPongProvider>
          <PromptProvider>
            <ModelProvider>
              <LoraProvider>
                <UpscalersProvider>
                  <ImageUploadProvider>
                    <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} >
                      <FullPageDropzone>
                        <App />
                      </FullPageDropzone>
                    </SnackbarProvider>
                  </ImageUploadProvider>
                </UpscalersProvider>
              </LoraProvider>
            </ModelProvider>
          </PromptProvider>
        </PingPongProvider>
      </ThemeWrapper>
    </DimensionsProvider>
  </StrictMode>,
)