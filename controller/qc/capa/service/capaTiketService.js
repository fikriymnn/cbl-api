const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const CapaTicket = require("../../../../model/qc/capa/capaTiketmodel");
const capaKetidaksesuain = require("../../../../model/qc/capa/capaKetidakSesuaianModel");

const CapaTiketService = {
  // Membuat satu tiket CAPA untuk tiap department pada NCR.
  createCapaFromNcr: async (idNcr, transaction) => {
    const ncrTiket = await NcrTicket.findByPk(idNcr, {
      include: [
        {
          model: NcrDepartment,
          as: "data_department",
          include: [
            {
              model: NcrKetidaksesuain,
              as: "data_ketidaksesuaian",
            },
          ],
        },
      ],
      transaction,
    });

    for (const department of ncrTiket.data_department) {
      const capaTiket = await CapaTicket.create(
        {
          id_ncr: ncrTiket.id,
          id_pelapor: ncrTiket.id_pelapor,
          nama_pelapor: ncrTiket.nama_pelapor,
          department_pelapor: ncrTiket.department_pelapor,
          id_department: department.id_department,
          department: department.department,
          tanggal_lapor: ncrTiket.tanggal,
          tanggal: new Date(),
          kategori_laporan: ncrTiket.kategori_laporan,
          id_jo: ncrTiket.id_jo,
          id_io: ncrTiket.id_io,
          no_jo: ncrTiket.no_jo,
          no_io: ncrTiket.no_io,
          nama_produk: ncrTiket.nama_produk,
          catatan_qa: ncrTiket.catatan_qa,
          catatan_mr: ncrTiket.catatan_mr,
        },
        { transaction }
      );

      for (const poin of department.data_ketidaksesuaian) {
        await capaKetidaksesuain.create(
          {
            id_capa: capaTiket.id,
            ketidaksesuaian: poin.ketidaksesuaian,
            file: poin.file,
          },
          { transaction }
        );
      }
    }
  },
};

module.exports = CapaTiketService;
