using System.Security.Cryptography;

namespace Chamomile.Common {

    /// <summary>Image download object</summary>
    public class ImageDownload {

        /// <summary>Acceptable MiME extensions for photos</summary>
        public static readonly Dictionary<string, string> AcceptableMimeTypeExtensions = new(StringComparer.InvariantCultureIgnoreCase){
            { "image/jpeg", ".jpg" }, //jpg
            { "image/png", ".png" }, //png
            { "image/gif", ".gif" }, //gif
            { "image/bmp", ".bmp" }, //bmp
            { "image/webp", ".webp" }, //webp
            { "image/svg+xml", ".svg"}, //svg
            { "image/svg", ".svg"}, //svg
        };

        /// <summary>Filename of this image</summary>
        public string Filename { get; set; } = "";

        /// <summary>Extension of this image</summary>
        public string? Extension => AcceptableMimeTypeExtensions.GetValueOrDefault(Mime ?? "");

        /// <summary>Full Filename: Filename + extension</summary>
        public string FullFilename => Filename + (!string.IsNullOrWhiteSpace(Extension) ? Extension : "");

        /// <summary>MIME type of this image</summary>
        public string? Mime { get; set; } = "";

        /// <summary>Raw bytes of this image</summary>
        public byte[]? Data { get; set; } = [];

        private string? _hash;

        /// <summary> Hash of this image</summary>
        public string Hash => _hash ??= Convert.ToBase64String(SHA256.HashData(Data ?? []));
        //I LOVE COMPOUND ASSIGNMENT! GOD BLESS C#

    }
}
