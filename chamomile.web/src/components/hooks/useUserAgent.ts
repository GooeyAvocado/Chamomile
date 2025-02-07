export default function useUserAgent() {
    const agent =navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return {agent:agent, isMobile:isMobile}; // This component doesn't render anything
}
