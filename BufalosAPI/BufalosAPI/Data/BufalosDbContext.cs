using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Data
{
    public class BufalosDbContext : DbContext
    {
        public BufalosDbContext(DbContextOptions<BufalosDbContext> options) : base(options) { }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallePedidos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapeo TB_Roles
            modelBuilder.Entity<Rol>(e =>
            {
                e.ToTable("TB_Roles");
                e.HasKey(r => r.Id_Rol); // Con guion bajo
            });

            // Mapeo TB_Usuarios
            modelBuilder.Entity<Usuario>(e =>
            {
                e.ToTable("TB_Usuarios");
                e.HasKey(u => u.Id_Usuario); // Con guion bajo
                e.HasOne(u => u.Rol).WithMany().HasForeignKey(u => u.Id_Rol);
            });

            // Mapeo TB_Categorias
            modelBuilder.Entity<Categoria>(e =>
            {
                e.ToTable("TB_Categorias");
                e.HasKey(c => c.Id_Categoria);
            });

            // Mapeo TB_Productos
            modelBuilder.Entity<Producto>(e =>
            {
                e.ToTable("TB_Productos");
                e.HasKey(p => p.Id_Producto); // Con guion bajo
                e.Property(p => p.Precio).HasColumnType("decimal(10,2)");
                e.HasOne(p => p.Categoria).WithMany().HasForeignKey(p => p.Id_Categoria);
            });

            // Mapeo TB_Pedidos
            modelBuilder.Entity<Pedido>(e =>
            {
                e.ToTable("TB_Pedidos");
                e.HasKey(p => p.Id_Pedido);
                e.Property(p => p.Total).HasColumnType("decimal(10,2)");
                e.HasOne(p => p.Usuario).WithMany().HasForeignKey(p => p.Id_Usuario);
            });

            // Mapeo TB_DetallePedidos
            modelBuilder.Entity<DetallePedido>(e =>
            {
                e.ToTable("TB_DetallePedidos");
                e.HasKey(d => d.Id_DetallePedido);
                e.Property(d => d.PrecioUnitario).HasColumnType("decimal(10,2)");
                e.HasOne<Pedido>().WithMany(p => p.Detalles).HasForeignKey(d => d.Id_Pedido);
                e.HasOne(d => d.Producto).WithMany().HasForeignKey(d => d.Id_Producto);
            });
        }
    }
}