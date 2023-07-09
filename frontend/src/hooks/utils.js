import Swal from "sweetalert2";

export const truncateAddress = (address) => {
    if (!address) return "-";
    const match = address.match(
      /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  };
  
  export const showTxConfirmation = () => {
    Swal.fire({
      title: 'Confirmation of transaction',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(Swal.getDenyButton())
      }
    } );
  }