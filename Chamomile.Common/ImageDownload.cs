using System.Security.Cryptography;

namespace Hue.Common {
    public class ImageDownload {

        public static readonly Dictionary<string, string> AcceptableMimeTypeExtensions = new(StringComparer.InvariantCultureIgnoreCase){
            { "image/jpeg", ".jpg" }, //jpg
            { "image/png", ".png" }, //png
            { "image/gif", ".gif" }, //gif
            { "image/bmp", ".bmp" }, //bmp
            { "image/webp", ".webp" }, //webp
            { "image/svg+xml", ".svg"}, //svg
            { "image/svg", ".svg"}, //svg
        };

        public string Filename { get; set; } = "";

        public string? Extension => AcceptableMimeTypeExtensions.GetValueOrDefault(Mime ?? "");

        public string FullFilename => Filename + (!string.IsNullOrWhiteSpace(Extension) ? Extension : "");

        public string? Mime { get; set; } = "";
        public byte[]? Data { get; set; } = [];

        private string? _hash;

        public string Hash => _hash ??= Convert.ToBase64String(SHA256.HashData(Data ?? []));
        //I LOVE COMPOUND ASSIGNMENT! GOD BLESS C#



    }
}
