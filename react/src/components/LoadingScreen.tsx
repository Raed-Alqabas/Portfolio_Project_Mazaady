import logoImage from "../assets/main-logo-2.svg";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="loader">
                {/* The Logo (Center) */}
                <div className="relative w-24 h-24 flex items-center justify-center bg-white rounded-full shadow-md p-4">
                    <img
                        src={logoImage}
                        alt="Loading..."
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
